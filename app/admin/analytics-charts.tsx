'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

export function AnalyticsCharts({
  languageData
}: {
  languageData: { language: string; count: number }[]
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Popular Languages</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageData}>
                <XAxis
                  dataKey="language"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future expansion (e.g. Signups over time) */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
            <p>Activity Log coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
