import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar,
  Users,
  TrendingUp,
  Activity,
  Clock,
  BookOpen,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function Reports() {
  const [, setLocation] = useLocation();
  // Fetch student performance reports
  const { data: studentReports = [] } = useQuery({
    queryKey: ["/api/reports/student-performance"],
  });

  // Fetch students for detailed view
  const { data: students = [] } = useQuery({
    queryKey: ["/api/students"],
  });

  // Fetch teacher stats
  const { data: stats } = useQuery({
    queryKey: ["/api/teacher/stats"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Inactive":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const overviewStats = {
    totalStudents: students.length,
    totalExams: stats?.totalExams || 0,
    averageScore: studentReports.length > 0 
      ? Math.round(studentReports.reduce((sum: number, report: any) => sum + report.averageScore, 0) / studentReports.length)
      : 0,
    attendanceRate: stats?.attendanceRate || 0
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with Back button */}
      <div className="flex items-center space-x-4 mb-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation('/teacher')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          data-testid="button-back-to-dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
      </div>
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Comprehensive insights into student performance and center operations
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold">{overviewStats.totalStudents}</p>
                <p className="text-xs text-green-600 dark:text-green-400">+2 this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Exams</p>
                <p className="text-2xl font-bold">{overviewStats.totalExams}</p>
                <p className="text-xs text-gray-500">Created</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Score</p>
                <p className="text-2xl font-bold">{overviewStats.averageScore}%</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Center average</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance</p>
                <p className="text-2xl font-bold">{Math.round(overviewStats.attendanceRate)}%</p>
                <p className="text-xs text-green-600 dark:text-green-400">This month</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Student Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Report</TabsTrigger>
          <TabsTrigger value="exams">Exam Analytics</TabsTrigger>
          <TabsTrigger value="communication">Communication Log</TabsTrigger>
        </TabsList>

        {/* Student Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Student Performance Overview
              </CardTitle>
              <CardDescription>
                Detailed performance metrics for all students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentReports.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <Label htmlFor="filter-subject">Filter by Subject</Label>
                      <Select>
                        <SelectTrigger id="filter-subject" data-testid="select-filter-subject">
                          <SelectValue placeholder="All subjects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subjects</SelectItem>
                          <SelectItem value="chemistry">🧪 Chemistry</SelectItem>
                          <SelectItem value="ict">💻 ICT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-batch">Filter by Batch</Label>
                      <Select>
                        <SelectTrigger id="filter-batch" data-testid="select-filter-batch">
                          <SelectValue placeholder="All batches" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Batches</SelectItem>
                          <SelectItem value="22che">22CHE</SelectItem>
                          <SelectItem value="23che">23CHE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="search-student">Search Student</Label>
                      <Input
                        id="search-student"
                        placeholder="Search by name or ID..."
                        data-testid="input-search-student"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Student</th>
                          <th className="text-left p-3 font-medium">Contact</th>
                          <th className="text-center p-3 font-medium">Exams Taken</th>
                          <th className="text-center p-3 font-medium">Avg. Score</th>
                          <th className="text-center p-3 font-medium">Last Activity</th>
                          <th className="text-center p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentReports.map((report: any) => (
                          <tr
                            key={report.id}
                            className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                            data-testid={`row-student-${report.studentId}`}
                          >
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{report.name}</div>
                                <div className="text-sm text-gray-500">{report.studentId}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {report.phoneNumber}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="font-medium">{report.completedExams}</div>
                              <div className="text-xs text-gray-500">of {report.totalExams}</div>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`font-bold ${getPerformanceColor(report.averageScore)}`}>
                                {report.averageScore}%
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(report.lastActivity))} ago
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {getStatusIcon(report.status)}
                                <Badge variant={report.status === "Active" ? "default" : "secondary"}>
                                  {report.status}
                                </Badge>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Performance Data Available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Student performance data will appear here once exams are conducted.
                  </p>
                  <Button asChild>
                    <a href="/teacher/exams">
                      Create First Exam
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Report Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Report
              </CardTitle>
              <CardDescription>
                Track student attendance patterns and regularity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Attendance Tracking Coming Soon
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Comprehensive attendance reports and analytics will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exam Analytics Tab */}
        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Exam Analytics
              </CardTitle>
              <CardDescription>
                Analyze exam difficulty, performance distribution, and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Exam Data Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create and conduct exams to see detailed analytics and insights.
                </p>
                <Button asChild>
                  <a href="/teacher/exams">
                    Create Exam
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Log Tab */}
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Communication Log
              </CardTitle>
              <CardDescription>
                Track SMS messages, notifications, and communication history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Communication History
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  SMS and notification logs will appear here once you start communicating with students.
                </p>
                <Button asChild>
                  <a href="/teacher/sms">
                    Send SMS
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}