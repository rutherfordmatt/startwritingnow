import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ThemeToggle";
import { format } from "date-fns";
import { Users, Mail, Bell, FileText, Download, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { AdminStats, AdminUser } from "@shared/routes";

export default function Admin() {
  const { toast } = useToast();
  
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });
  
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const handleExportCSV = () => {
    if (!users) return;
    
    const usersWithEmail = users.filter(u => u.email);
    if (usersWithEmail.length === 0) {
      toast({ 
        title: "No emails to export", 
        description: "There are no users with email addresses.",
        variant: "destructive"
      });
      return;
    }
    
    let csvContent = "email,name\n";
    usersWithEmail.forEach(u => {
      const name = u.firstName && u.lastName 
        ? `${u.firstName} ${u.lastName}`
        : u.firstName || u.lastName || "";
      const escapedName = name.includes(",") ? `"${name}"` : name;
      csvContent += `${u.email},${escapedName}\n`;
    });
    
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `users_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({ 
      title: "Exported", 
      description: `${usersWithEmail.length} email(s) downloaded as CSV. Ready for Ghost import!` 
    });
  };

  const isLoading = statsLoading || usersLoading;
  const hasError = statsError || usersError;

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to view this page. Admin access is required.
            </p>
            <Link href="/dashboard">
              <Button data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-medium mb-4">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card data-testid="stat-total-users">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                  </CardContent>
                </Card>

                <Card data-testid="stat-users-with-email">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      With Email
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.usersWithEmail ?? 0}</div>
                  </CardContent>
                </Card>

                <Card data-testid="stat-reminders-enabled">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Reminders On
                    </CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.usersWithReminders ?? 0}</div>
                  </CardContent>
                </Card>

                <Card data-testid="stat-total-entries">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Journal Entries
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalEntries ?? 0}</div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Users</h2>
                <Button 
                  onClick={handleExportCSV} 
                  disabled={!users || users.length === 0}
                  data-testid="button-export-csv"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Emails (CSV)
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-users">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">Username</th>
                          <th className="text-left p-4 font-medium">Email</th>
                          <th className="text-left p-4 font-medium">Name</th>
                          <th className="text-left p-4 font-medium">Signed Up</th>
                          <th className="text-left p-4 font-medium">Reminders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users && users.length > 0 ? (
                          users.map((user) => (
                            <tr 
                              key={user.id} 
                              className="border-b last:border-0 hover-elevate"
                              data-testid={`row-user-${user.id}`}
                            >
                              <td className="p-4 font-medium">{user.username}</td>
                              <td className="p-4 text-muted-foreground">
                                {user.email || <span className="italic">No email</span>}
                              </td>
                              <td className="p-4">
                                {user.firstName || user.lastName 
                                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                  : <span className="text-muted-foreground italic">—</span>
                                }
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {user.createdAt 
                                  ? format(new Date(user.createdAt), "MMM d, yyyy")
                                  : "—"
                                }
                              </td>
                              <td className="p-4">
                                {user.reminderEnabled 
                                  ? <span className="text-green-600 dark:text-green-400">On</span>
                                  : <span className="text-muted-foreground">Off</span>
                                }
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                              No users yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
