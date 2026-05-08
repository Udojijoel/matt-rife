import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, ShoppingBag, ClipboardList, DollarSign, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import AnalyticsChart from "@/components/admin/AnalyticsChart";

interface Stats {
  totalShows: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingInquiries: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalShows: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingInquiries: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [showsRes, productsRes, ordersRes, inquiriesRes] = await Promise.all([
        supabase.from("shows").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total"),
        supabase.from("private_show_inquiries").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      setStats({
        totalShows: showsRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalRevenue,
        pendingInquiries: inquiriesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Shows",
      value: stats.totalShows,
      icon: Ticket,
      href: "/admin/shows",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: ShoppingBag,
      href: "/admin/products",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      icon: ClipboardList,
      href: "/admin/orders",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      href: "/admin/orders",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Pending Inquiries",
      value: stats.pendingInquiries,
      icon: MessageSquare,
      href: "/admin/inquiries",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      badge: stats.pendingInquiries > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl gradient-text">DASHBOARD</h1>
        <p className="text-muted-foreground mt-1">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.href}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors relative"
            >
              {"badge" in stat && stat.badge && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {stat.value}
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">
                    {isLoading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <AnalyticsChart />

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-display text-2xl mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/shows"
            className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
          >
            <Ticket className="text-primary" />
            <span>Manage Shows</span>
          </Link>
          <Link
            to="/admin/products"
            className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
          >
            <ShoppingBag className="text-accent" />
            <span>Manage Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
          >
            <ClipboardList className="text-green-500" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
