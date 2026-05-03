import {
  DollarSign, Shield, Globe, Wrench, Lightbulb, GraduationCap, Gift, Building,
  Search, Phone, Mail, MapPin, CheckCircle, Building2, User, FileText,
  BookOpen, Newspaper, BarChart2, FileEdit, Image, Paperclip, Info,
  ClipboardList, TrendingUp, Clock, XCircle, AlertCircle, Check,
  ChevronRight, ChevronDown, ChevronLeft, Bell, Settings, LogOut,
  LayoutDashboard, Calculator, CalendarCheck, FolderOpen, ArrowUpRight,
  Briefcase, Users, Activity, Download, Plus, Minus, RefreshCw,
} from 'lucide-react';

const ICON_MAP = {
  DollarSign, Shield, Globe, Wrench, Lightbulb, GraduationCap, Gift, Building,
  Search, Phone, Mail, MapPin, CheckCircle, Building2, User, FileText,
  BookOpen, Newspaper, BarChart2, FileEdit, Image, Paperclip, Info,
  ClipboardList, TrendingUp, Clock, XCircle, AlertCircle, Check,
  ChevronRight, ChevronDown, ChevronLeft, Bell, Settings, LogOut,
  LayoutDashboard, Calculator, CalendarCheck, FolderOpen, ArrowUpRight,
  Briefcase, Users, Activity, Download, Plus, Minus, RefreshCw,
};

export default function Icon({ name, size = 20, className = '', ...props }) {
  const Component = ICON_MAP[name];
  if (!Component) return null;
  return <Component size={size} className={className} {...props} />;
}
