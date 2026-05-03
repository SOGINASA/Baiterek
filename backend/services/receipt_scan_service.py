import json
import os
import re
import logging
import base64

import requests as http_requests

logger = logging.getLogger(__name__)

_groq_key = os.environ.get("GROQ_API_KEY", "")

RECEIPT_SYSTEM_PROMPT = """Ты — система распознавания продуктов с чеков (receipt OCR).
Пользователь отправляет фото чека из магазина. Твоя задача — извлечь список продуктов.

ПРАВИЛА:
1. Верни ТОЛЬКО валидный JSON-массив, без markdown, без комментариев, без пояснений.
2. Каждый элемент массива — объект с полями:
   - "name": название продукта (строка, на языке чека, очищенное от артикулов и кодов)
   - "quantity": количество (число, по умолчанию 1)
   - "price": цена за позицию (число, если видна)
3. Убирай из названий: коды товаров, штрихкоды, артикулы, символы *, #, номера позиций.
4. Если продукт сокращён — расшифруй по контексту (например "МОЛ 3.2%" → "Молоко 3.2%").
5. Не включай строки с итогами, налогами, скидками, номерами чека, датами.
6. Если на фото не чек или продукты не распознаются — верни пустой массив [].

Пример ответа:
[{"name": "Молоко 3.2%", "quantity": 1, "price": 89}, {"name": "Хлеб белый", "quantity": 2, "price": 45}]"""

BARCODE_SYSTEM_PROMPT = """Ты — система распознавания продуктов с фото упаковки.
Пользователь отправляет фото продукта или его упаковки (возможно со штрихкодом). Твоя задача — определить, что это за продукт.

ВАЖНО: Внимательно прочитай ВСЕ надписи, видимые на упаковке — название продукта, бренд, описание, состав, объём/вес. Используй эту информацию, чтобы точно определить продукт.

ПРАВИЛА:
1. Верни ТОЛЬКО валидный JSON-объект, без markdown, без комментариев.
2. Объект должен содержать поля:
   - "name": ПОЛНОЕ название продукта, как написано на упаковке (например "Молоко ультрапастеризованное 3.2% 1л"). Если видишь текст на упаковке — используй его. НИКОГДА не возвращай null если видишь хоть какой-то текст на фото.
   - "barcode": штрихкод если виден (строка или null)
   - "brand": бренд/производитель если виден (строка или null)
   - "category": категория продукта — одна из: dairy, meat, vegetables, fruits, bakery, drinks, grains, frozen, snacks, other
3. Если на фото виден ТОЛЬКО штрихкод без упаковки — всё равно попробуй определить продукт по любым видимым деталям. Если совсем ничего не понятно — тогда верни name как null.
4. Если видишь бренд но не видишь точное название — укажи бренд + тип продукта, который ты можешь определить по форме/цвету упаковки.

Примеры:
{"name": "Молоко Простоквашино 3.2% 930мл", "barcode": "4607012345678", "brand": "Простоквашино", "category": "dairy"}
{"name": "Coca-Cola Original 0.5л", "barcode": "5449000000996", "brand": "Coca-Cola", "category": "drinks"}
{"name": "Мука пшеничная высший сорт 2кг", "barcode": null, "brand": "Макфа", "category": "grains"}"""


def _compress_image(image_bytes: bytes, max_width: int = 1280, quality: int = 75) -> bytes:
    """Compress image to reduce payload size."""
    from io import BytesIO
    from PIL import Image

    img = Image.open(BytesIO(image_bytes))

    if img.mode in ('RGBA', 'P', 'LA'):
        img = img.convert('RGB')

    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.LANCZOS)

    buf = BytesIO()
    img.save(buf, format='JPEG', quality=quality, optimize=True)
    result = buf.getvalue()
    logger.info(f"Image compressed: {len(image_bytes)} -> {len(result)} bytes ({img.width}x{img.height})")
    return result


_GROQ_VISION_MODELS = [
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
]


def _call_groq(system_prompt: str, image_bytes: bytes, user_text: str, content_type: str = "image/jpeg") -> str:
    """Call Groq Vision API (Llama 4 Scout/Maverick)."""
    if not _groq_key:
        raise RuntimeError("GROQ_API_KEY not set")

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{content_type};base64,{b64}"

    last_error = None
    for model_name in _GROQ_VISION_MODELS:
        payload = {
            "model": model_name,
            "messages": [
                {"role": "user", "content": [
                    {"type": "text", "text": system_prompt + "\n\n" + user_text},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ]},
            ],
            "max_tokens": 2048,
            "temperature": 0.3,
        }

        resp = http_requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {_groq_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )

        if resp.status_code == 200:
            raw = resp.json()["choices"][0]["message"]["content"]
            logger.info(f"Groq ({model_name}) response: {raw[:300]}")
            return raw
        else:
            last_error = f"Groq {model_name}: {resp.status_code} {resp.text[:300]}"
            logger.warning(last_error)

    raise RuntimeError(last_error or "All Groq vision models failed")


def _call_vision(system_prompt: str, image_bytes: bytes, user_text: str = "Распознай продукты на этом изображении.", content_type: str = "image/jpeg") -> str:
    """Call Groq vision API."""
    try:
        image_bytes = _compress_image(image_bytes)
        content_type = "image/jpeg"
    except Exception as e:
        logger.warning(f"Image compression failed, using original: {e}")

    return _call_groq(system_prompt, image_bytes, user_text, content_type)


def _extract_json(text: str):
    """Extract JSON from model response that may contain markdown fences or extra text."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    fence_match = re.search(r"```(?:json)?\s*\n?([\s\S]*?)\n?```", text)
    if fence_match:
        try:
            return json.loads(fence_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    for pattern in [r"\[[\s\S]*\]", r"\{[\s\S]*\}"]:
        m = re.search(pattern, text)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                pass

    logger.error(f"Could not extract JSON from response: {text[:200]}")
    return None


def scan_receipt(image_bytes: bytes, content_type: str = "image/jpeg") -> list:
    """Scan a receipt image and return a list of products."""
    raw_response = _call_vision(RECEIPT_SYSTEM_PROMPT, image_bytes,
                                "Распознай продукты на этом чеке.", content_type)
    logger.info(f"Receipt scan raw response: {raw_response[:300]}")

    parsed = _extract_json(raw_response)

    if parsed is None or not isinstance(parsed, list):
        return []

    products = []
    for item in parsed:
        if not isinstance(item, dict):
            continue
        name = item.get("name")
        if not name:
            continue
        products.append({
            "name": str(name).strip(),
            "quantity": float(item.get("quantity", 1)),
            "price": float(item["price"]) if item.get("price") is not None else None,
        })

    return products


def _lookup_barcode_openfoodfacts(barcode: str) -> dict | None:
    """Look up a barcode in Open Food Facts database."""
    try:
        resp = http_requests.get(
            f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json",
            headers={"User-Agent": "FoodTrack/1.0"},
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("status") != 1:
            return None
        product = data.get("product", {})
        name = product.get("product_name") or product.get("product_name_ru") or product.get("product_name_en")
        brand = product.get("brands")
        categories_tag = (product.get("categories_tags") or [])
        category = _map_category(categories_tag)
        return {"name": name, "brand": brand, "category": category}
    except Exception as e:
        logger.warning(f"Open Food Facts lookup failed: {e}")
        return None


def _lookup_barcode_upcitemdb(barcode: str) -> dict | None:
    """Look up a barcode in UPCitemdb (free trial API)."""
    try:
        resp = http_requests.get(
            f"https://api.upcitemdb.com/prod/trial/lookup",
            params={"upc": barcode},
            headers={"User-Agent": "FoodTrack/1.0"},
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        items = data.get("items", [])
        if not items:
            return None
        item = items[0]
        name = item.get("title")
        brand = item.get("brand")
        return {"name": name, "brand": brand, "category": "other"}
    except Exception as e:
        logger.warning(f"UPCitemdb lookup failed: {e}")
        return None


def _map_category(categories_tags: list) -> str:
    """Map Open Food Facts category tags to our category system."""
    category_map = {
        "dairy": ["dairies", "milk", "cheese", "yogurt", "butter", "cream"],
        "meat": ["meats", "beef", "pork", "chicken", "poultry", "sausage"],
        "vegetables": ["vegetables", "vegetable"],
        "fruits": ["fruits", "fruit"],
        "bakery": ["bread", "bakery", "pastry", "biscuit"],
        "drinks": ["beverages", "drink", "water", "juice", "soda", "tea", "coffee"],
        "grains": ["cereals", "grain", "rice", "pasta", "noodle"],
        "frozen": ["frozen"],
        "snacks": ["snacks", "chips", "candy", "chocolate", "sweet"],
    }
    cats_lower = " ".join(categories_tags).lower()
    for cat, keywords in category_map.items():
        if any(kw in cats_lower for kw in keywords):
            return cat
    return "other"


def _lookup_barcode(barcode: str) -> dict | None:
    """Look up barcode in multiple databases."""
    # Try Open Food Facts first
    result = _lookup_barcode_openfoodfacts(barcode)
    if result and result.get("name"):
        logger.info(f"Found in Open Food Facts: {result}")
        return result

    # Try UPCitemdb
    result = _lookup_barcode_upcitemdb(barcode)
    if result and result.get("name"):
        logger.info(f"Found in UPCitemdb: {result}")
        return result

    return None


def scan_barcode(image_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    """Scan a barcode/product image and return product info."""
    raw_response = _call_vision(
        BARCODE_SYSTEM_PROMPT, image_bytes,
        "Внимательно прочитай все надписи на упаковке и определи продукт. Если виден штрихкод — прочитай его тоже.",
        content_type,
    )
    logger.info(f"Barcode scan raw response: {raw_response[:300]}")

    parsed = _extract_json(raw_response)

    if parsed is None or not isinstance(parsed, dict):
        return {"name": None, "barcode": None, "brand": None, "category": "other"}

    result = {
        "name": parsed.get("name"),
        "barcode": parsed.get("barcode"),
        "brand": parsed.get("brand"),
        "category": parsed.get("category", "other"),
    }

    # If AI detected barcode but not the product name, look it up in databases
    if not result["name"] and result["barcode"]:
        logger.info(f"Looking up barcode {result['barcode']} in databases...")
        db_data = _lookup_barcode(result["barcode"])
        if db_data and db_data.get("name"):
            result["name"] = db_data["name"]
            if not result["brand"] and db_data.get("brand"):
                result["brand"] = db_data["brand"]
            if result["category"] == "other" and db_data.get("category") != "other":
                result["category"] = db_data["category"]

    return result
