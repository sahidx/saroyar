import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { CreditCard, MessageCircle, TrendingUp, Clock, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface SMSBalanceProps {
  isDarkMode?: boolean;
}

export default function SMSBalance({ isDarkMode = false }: SMSBalanceProps) {
  const [, setLocation] = useLocation();
  
  // Fetch real-time SMS credits
  const { data: smsCreditsData } = useQuery({
    queryKey: ['/api/user/sms-credits'],
    refetchInterval: 5000 // Update every 5 seconds
  });

  // Fetch SMS usage statistics  
  const { data: smsStats } = useQuery({
    queryKey: ['/api/sms/usage-stats']
  });

  const currentCredits = (smsCreditsData as any)?.smsCredits || 0;
  const smsRate = 0.39; // Taka per SMS

  return (
    <div className={`min-h-screen p-4 ${isDarkMode 
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
      : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/teacher')}
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              SMS Balance
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              View your SMS credits and usage statistics
            </p>
          </div>
        </div>

        {/* Current Balance Card */}
        <Card className={`mb-6 ${isDarkMode 
          ? 'bg-slate-800/50 border-blue-400/30' 
          : 'bg-white/90 border-blue-200'} backdrop-blur-sm shadow-xl`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <CreditCard className="w-5 h-5" />
              Current SMS Balance
            </CardTitle>
            <CardDescription>
              Your available SMS credits for sending messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${
                    currentCredits > 50 ? 'text-green-600' : 
                    currentCredits > 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {currentCredits}
                  </span>
                  <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    SMS Credits
                  </span>
                </div>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Rate: ৳{smsRate} per SMS
                </p>
              </div>
              <Badge 
                variant={currentCredits > 10 ? "default" : "destructive"}
                className="text-lg px-4 py-2"
                data-testid="badge-balance-status"
              >
                {currentCredits > 50 ? 'Good' : currentCredits > 10 ? 'Low' : 'Empty'}
              </Badge>
            </div>

            {/* Low balance warning */}
            {currentCredits <= 10 && (
              <div className={`mt-4 p-3 rounded-lg ${
                currentCredits === 0 
                  ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                  : 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
              }`}>
                <p className={`text-sm font-medium ${
                  currentCredits === 0 ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
                }`}>
                  {currentCredits === 0 
                    ? '⚠️ No SMS credits remaining! Contact admin to add credits.'
                    : `⚠️ Low SMS balance! Only ${currentCredits} credits remaining.`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className={isDarkMode ? 'bg-slate-800/50' : 'bg-white/90'}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-blue-500" />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {(smsStats as any)?.thisMonth || 0}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    This Month SMS
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-slate-800/50' : 'bg-white/90'}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ৳{((smsStats?.thisMonth || 0) * smsRate).toFixed(2)}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    This Month Cost
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-slate-800/50' : 'bg-white/90'}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-purple-500" />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {(smsStats as any)?.thisMonth || 0}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    This Month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SMS Management Info */}
        <Card className={isDarkMode ? 'bg-slate-800/50' : 'bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <MessageCircle className="w-5 h-5" />
              SMS Credit Management
            </CardTitle>
            <CardDescription>
              How SMS credits work in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Credit System
                </h4>
                <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Each SMS costs ৳{smsRate}</li>
                  <li>• Credits are added by the system administrator</li>
                  <li>• Balance updates in real-time when SMS is sent</li>
                  <li>• No SMS can be sent when balance is 0 (highly secure)</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  SMS Features
                </h4>
                <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Bulk messaging to students</li>
                  <li>• Exam result notifications</li>
                  <li>• Attendance alerts</li>
                  <li>• General announcements</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg border-2 ${
                currentCredits <= 10 
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                  : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  currentCredits <= 10 
                    ? 'text-red-700 dark:text-red-400' 
                    : 'text-blue-700 dark:text-blue-400'
                }`}>
                  Need More Credits?
                </h4>
                <p className={`text-sm ${
                  currentCredits <= 10 
                    ? 'text-red-600 dark:text-red-300' 
                    : 'text-blue-600 dark:text-blue-300'
                }`}>
                  Contact the system administrator to add more SMS credits to your account.
                  Credits are added when you make offline payments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}