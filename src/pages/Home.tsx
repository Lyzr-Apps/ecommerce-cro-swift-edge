import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Search,
  Loader2,
  Check,
  X,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Zap,
  BarChart,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Store,
  MessageSquare,
  Menu,
  Brain,
  MapPin
} from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'

// Agent ID from test data
const AGENT_ID = "69797ab1a5d355f8aa48876f"

// TypeScript interfaces from ACTUAL test response
interface StoreInfo {
  website: string
  business_name: string
  detected_category: string
  verified: boolean
}

interface PlatformResult {
  found: boolean
  position: string
  context: string
}

interface SearchQueryResult {
  query: string
  platforms: {
    chatgpt: PlatformResult
    perplexity: PlatformResult
    gemini: PlatformResult
    claude: PlatformResult
  }
}

interface VisibilitySummary {
  chatgpt_score: number
  perplexity_score: number
  gemini_score: number
  claude_score: number
}

interface AiSearchAnalysis {
  overall_score: number
  search_queries_tested: SearchQueryResult[]
  visibility_summary: VisibilitySummary
  agentic_shopping_readiness: 'low' | 'medium' | 'high'
  improvement_areas: string[]
}

interface GoogleBusinessProfile {
  exists: boolean
  status: string
  completeness_score: number
  missing_fields: string[]
  issues: string[]
}

interface GoogleMerchantCenter {
  exists: boolean
  account_status: string
  feed_health: string
  active_products: number
  errors_count: number
  warnings_count: number
  critical_issues: string[]
}

interface GooglePresenceDetection {
  google_business_profile: GoogleBusinessProfile
  google_merchant_center: GoogleMerchantCenter
}

interface NextActionable {
  priority: number
  action: string
  category: 'gmc' | 'gbp' | 'ai_search'
  impact: 'high' | 'medium' | 'low'
  automation_available: boolean
  estimated_time: string
  steps: string[]
  can_start_now: boolean
}

interface AgentResult {
  store_info: StoreInfo
  ai_search_analysis: AiSearchAnalysis
  google_presence_detection: GooglePresenceDetection
  next_actionables: NextActionable[]
  recommendations?: string[]
  guided_workflows?: string[]
}

type View = 'onboarding' | 'dashboard' | 'ai-search' | 'google-ecosystem' | 'next-actions' | 'chat'

// Helper functions
function getScoreColor(score: number): string {
  if (score >= 61) return 'text-emerald-600'
  if (score >= 31) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreBadgeColor(score: number): string {
  if (score >= 81) return 'bg-emerald-100 text-emerald-800'
  if (score >= 61) return 'bg-blue-100 text-blue-800'
  if (score >= 31) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function getScoreLabel(score: number): string {
  if (score >= 81) return 'Excellent'
  if (score >= 61) return 'Good'
  if (score >= 31) return 'Needs Work'
  return 'Critical'
}

function getReadinessBadgeColor(readiness: string): string {
  if (readiness === 'high') return 'bg-emerald-100 text-emerald-800'
  if (readiness === 'medium') return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function getCategoryBadgeColor(category: string): string {
  const colors: Record<string, string> = {
    gmc: 'bg-teal-100 text-teal-800 border-teal-300',
    gbp: 'bg-purple-100 text-purple-800 border-purple-300',
    ai_search: 'bg-blue-100 text-blue-800 border-blue-300'
  }
  return colors[category] || 'bg-slate-100 text-slate-800 border-slate-300'
}

function getImpactBadgeColor(impact: string): string {
  if (impact === 'high') return 'bg-red-100 text-red-800'
  if (impact === 'medium') return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

// Sub-components defined outside main component
function OnboardingScreen({ onAnalyze, loading }: { onAnalyze: (url: string) => void; loading: boolean }) {
  const [storeUrl, setStoreUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (storeUrl.trim() && !loading) {
      onAnalyze(storeUrl.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-xl border-2 border-slate-200">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
              Optimize Your Store for AI Search & Google Shopping
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              Enter your store URL to get started with AI-powered optimization
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="Enter your store URL (e.g., mystore.com) or business name"
                className="pl-12 h-14 text-lg border-2 border-slate-300 focus:border-teal-500"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={!storeUrl.trim() || loading}
              className="w-full h-12 text-lg bg-teal-500 hover:bg-teal-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Store...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Analyze Store
                </>
              )}
            </Button>
          </form>

          {loading && (
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                <span>Analyzing AI-search visibility...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                <span>Checking Google Business Profile...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                <span>Auditing Google Merchant Center...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                <span>Generating recommendations...</span>
              </div>
            </div>
          )}

          {!loading && (
            <div className="bg-slate-50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-slate-900 mb-3">What happens next:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    AI-search visibility analysis across ChatGPT, Perplexity, Gemini & Claude
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    Google Business Profile & Merchant Center audit
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    Prioritized optimization roadmap
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StoreInfoCard({ storeInfo, onReanalyze }: { storeInfo: StoreInfo; onReanalyze: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{storeInfo.business_name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <a
                  href={storeInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline flex items-center gap-1"
                >
                  {storeInfo.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{storeInfo.detected_category}</Badge>
                {storeInfo.verified && (
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={onReanalyze}
            variant="outline"
            size="sm"
            className="border-teal-500 text-teal-600 hover:bg-teal-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-analyze
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

function MetricsGrid({ result }: { result: AgentResult }) {
  const gbpScore = result.google_presence_detection.google_business_profile.completeness_score
  const gmcStatus = result.google_presence_detection.google_merchant_center.account_status

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">AI-Search Score</CardTitle>
          <Brain className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getScoreColor(result.ai_search_analysis.overall_score)}`}>
            {result.ai_search_analysis.overall_score}
          </div>
          <Badge className={`mt-2 ${getScoreBadgeColor(result.ai_search_analysis.overall_score)}`}>
            {getScoreLabel(result.ai_search_analysis.overall_score)}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Agentic Shopping</CardTitle>
          <Sparkles className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize text-slate-700">
            {result.ai_search_analysis.agentic_shopping_readiness}
          </div>
          <Badge className={`mt-2 ${getReadinessBadgeColor(result.ai_search_analysis.agentic_shopping_readiness)}`}>
            {result.ai_search_analysis.agentic_shopping_readiness.toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">GBP Completeness</CardTitle>
          <MapPin className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getScoreColor(gbpScore)}`}>
            {gbpScore}%
          </div>
          <Progress value={gbpScore} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">GMC Status</CardTitle>
          <ShoppingBag className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <Badge
            className={
              gmcStatus === 'not_found'
                ? 'bg-red-100 text-red-800'
                : gmcStatus === 'active'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-yellow-100 text-yellow-800'
            }
          >
            {gmcStatus.replace(/_/g, ' ').toUpperCase()}
          </Badge>
          {result.google_presence_detection.google_merchant_center.exists && (
            <p className="text-xs text-slate-600 mt-2">
              {result.google_presence_detection.google_merchant_center.active_products} products
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AiSearchQueryTable({ queries }: { queries: SearchQueryResult[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Search Query Results</CardTitle>
        <CardDescription>Platform-by-platform visibility analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Query</TableHead>
                <TableHead className="text-center font-semibold">ChatGPT</TableHead>
                <TableHead className="text-center font-semibold">Perplexity</TableHead>
                <TableHead className="text-center font-semibold">Gemini</TableHead>
                <TableHead className="text-center font-semibold">Claude</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.map((queryResult, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium max-w-xs">
                    {queryResult.query}
                  </TableCell>
                  <TableCell className="text-center">
                    {queryResult.platforms.chatgpt.found ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <Check className="h-3 w-3 mr-1" />
                          #{queryResult.platforms.chatgpt.position}
                        </Badge>
                      </div>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" />
                        Not found
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {queryResult.platforms.perplexity.found ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <Check className="h-3 w-3 mr-1" />
                          #{queryResult.platforms.perplexity.position}
                        </Badge>
                      </div>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" />
                        Not found
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {queryResult.platforms.gemini.found ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <Check className="h-3 w-3 mr-1" />
                          #{queryResult.platforms.gemini.position}
                        </Badge>
                      </div>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" />
                        Not found
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {queryResult.platforms.claude.found ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <Check className="h-3 w-3 mr-1" />
                          #{queryResult.platforms.claude.position}
                        </Badge>
                      </div>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" />
                        Not found
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function GooglePresenceCards({ googlePresence }: { googlePresence: GooglePresenceDetection }) {
  const gbp = googlePresence.google_business_profile
  const gmc = googlePresence.google_merchant_center

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              Google Business Profile
            </CardTitle>
            <Badge
              className={
                gbp.status === 'verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : gbp.status === 'unverified'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {gbp.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Completeness</span>
              <span className={`text-lg font-bold ${getScoreColor(gbp.completeness_score)}`}>
                {gbp.completeness_score}%
              </span>
            </div>
            <Progress value={gbp.completeness_score} className="h-2" />
          </div>

          {gbp.missing_fields.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Missing Fields:</h4>
              <div className="flex flex-wrap gap-2">
                {gbp.missing_fields.map((field, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {gbp.issues.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Issues:</h4>
              <div className="space-y-1">
                {gbp.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="h-3 w-3 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button className="w-full bg-purple-500 hover:bg-purple-600">
            Complete Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-teal-500" />
              Google Merchant Center
            </CardTitle>
            <Badge
              className={
                gmc.account_status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : gmc.account_status === 'suspended'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {gmc.account_status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {gmc.exists ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-600">Feed Health</p>
                  <Badge
                    className={
                      gmc.feed_health === 'critical'
                        ? 'bg-red-100 text-red-800 mt-1'
                        : gmc.feed_health === 'warning'
                        ? 'bg-yellow-100 text-yellow-800 mt-1'
                        : 'bg-emerald-100 text-emerald-800 mt-1'
                    }
                  >
                    {gmc.feed_health.toUpperCase()}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-600">Active Products</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{gmc.active_products}</p>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-600">Errors</p>
                  <p className="text-lg font-bold text-red-600 mt-1">{gmc.errors_count}</p>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-600">Warnings</p>
                  <p className="text-lg font-bold text-yellow-600 mt-1">{gmc.warnings_count}</p>
                </div>
              </div>
              <Button className="w-full bg-teal-500 hover:bg-teal-600">
                Optimize Feed
              </Button>
            </>
          ) : (
            <>
              {gmc.critical_issues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      {gmc.critical_issues.map((issue, idx) => (
                        <p key={idx} className="text-xs text-red-900">{issue}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <Button className="w-full bg-teal-500 hover:bg-teal-600">
                <Zap className="h-4 w-4 mr-2" />
                Set up GMC
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function NextActionablesSection({ actionables }: { actionables: NextActionable[] }) {
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const toggleExpand = (priority: number) => {
    setExpandedItems(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Actionables</CardTitle>
        <CardDescription>Priority-ordered optimization tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actionables
            .sort((a, b) => a.priority - b.priority)
            .map((actionable) => (
              <div
                key={actionable.priority}
                className={`border-2 rounded-lg ${getCategoryBadgeColor(actionable.category)}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {actionable.priority}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-2">{actionable.action}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge className={getCategoryBadgeColor(actionable.category)}>
                            {actionable.category.toUpperCase()}
                          </Badge>
                          <Badge className={getImpactBadgeColor(actionable.impact)}>
                            {actionable.impact.toUpperCase()} Impact
                          </Badge>
                          {actionable.automation_available && (
                            <Badge className="bg-teal-500 text-white">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto Available
                            </Badge>
                          )}
                          <span className="text-xs text-slate-600">
                            {actionable.estimated_time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(actionable.priority)}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedItems.includes(actionable.priority) ? 'rotate-90' : ''
                        }`}
                      />
                    </Button>
                  </div>

                  {expandedItems.includes(actionable.priority) && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <h5 className="text-xs font-semibold text-slate-700 mb-2">Steps:</h5>
                        <ol className="space-y-2">
                          {actionable.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                              <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                                {idx + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex gap-2">
                        {actionable.automation_available && (
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                            <Zap className="h-3 w-3 mr-1" />
                            Start Automation
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Steps
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('onboarding')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AgentResult | null>(null)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  // Check if user has completed onboarding
  useEffect(() => {
    const completed = localStorage.getItem('ai_cro_onboarding_complete')
    if (completed === 'true') {
      setOnboardingComplete(true)
      setCurrentView('dashboard')
    }
  }, [])

  const handleAnalyzeStore = async (storeUrl: string) => {
    setLoading(true)
    try {
      const message = `Analyze my store: ${storeUrl}`
      const result = await callAIAgent(message, AGENT_ID)

      if (result.success && result.response.status === 'success') {
        const agentResult = result.response.result as AgentResult
        setAnalysisResult(agentResult)
        setOnboardingComplete(true)
        localStorage.setItem('ai_cro_onboarding_complete', 'true')
        setCurrentView('dashboard')
      } else {
        console.error('Analysis failed:', result.error)
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReanalyze = () => {
    if (analysisResult?.store_info?.website) {
      handleAnalyzeStore(analysisResult.store_info.website)
    }
  }

  // Show onboarding if not complete
  if (!onboardingComplete) {
    return <OnboardingScreen onAnalyze={handleAnalyzeStore} loading={loading} />
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-[#1a1f36] text-white transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-[#00d4aa]">AI-CRO Advisor</h1>
        </div>
        <nav className="space-y-1 px-3">
          <button
            onClick={() => { setCurrentView('dashboard'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'dashboard'
                ? 'bg-[#00d4aa] text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BarChart className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => { setCurrentView('ai-search'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'ai-search'
                ? 'bg-[#00d4aa] text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Brain className="h-5 w-5" />
            <span>AI-Search Analysis</span>
          </button>
          <button
            onClick={() => { setCurrentView('google-ecosystem'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'google-ecosystem'
                ? 'bg-[#00d4aa] text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Search className="h-5 w-5" />
            <span>Google Ecosystem</span>
          </button>
          <button
            onClick={() => { setCurrentView('next-actions'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'next-actions'
                ? 'bg-[#00d4aa] text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Next Actions</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">
                {currentView === 'dashboard'
                  ? 'Dashboard'
                  : currentView === 'ai-search'
                  ? 'AI-Search Analysis'
                  : currentView === 'google-ecosystem'
                  ? 'Google Ecosystem'
                  : currentView === 'next-actions'
                  ? 'Next Actions'
                  : 'Chat'}
              </h2>
            </div>
            <Button
              onClick={() => setChatOpen(true)}
              className="bg-[#00d4aa] hover:bg-teal-600"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {analysisResult && currentView === 'dashboard' && (
            <div className="space-y-6">
              <StoreInfoCard storeInfo={analysisResult.store_info} onReanalyze={handleReanalyze} />
              <MetricsGrid result={analysisResult} />
              <AiSearchQueryTable queries={analysisResult.ai_search_analysis.search_queries_tested} />
              <GooglePresenceCards googlePresence={analysisResult.google_presence_detection} />
              <NextActionablesSection actionables={analysisResult.next_actionables} />
            </div>
          )}

          {analysisResult && currentView === 'ai-search' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Search Visibility Overview</CardTitle>
                  <CardDescription>Your visibility across AI search platforms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-700">Overall Score</span>
                    <div
                      className={`text-4xl font-bold ${getScoreColor(
                        analysisResult.ai_search_analysis.overall_score
                      )}`}
                    >
                      {analysisResult.ai_search_analysis.overall_score}
                    </div>
                  </div>
                  <Progress value={analysisResult.ai_search_analysis.overall_score} className="h-3" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Agentic Shopping Readiness:</span>
                    <Badge
                      className={getReadinessBadgeColor(
                        analysisResult.ai_search_analysis.agentic_shopping_readiness
                      )}
                    >
                      {analysisResult.ai_search_analysis.agentic_shopping_readiness.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">ChatGPT</span>
                        <Badge
                          className={getScoreBadgeColor(
                            analysisResult.ai_search_analysis.visibility_summary.chatgpt_score
                          )}
                        >
                          {analysisResult.ai_search_analysis.visibility_summary.chatgpt_score}
                        </Badge>
                      </div>
                      <Progress
                        value={analysisResult.ai_search_analysis.visibility_summary.chatgpt_score}
                        className="h-2"
                      />
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Perplexity</span>
                        <Badge
                          className={getScoreBadgeColor(
                            analysisResult.ai_search_analysis.visibility_summary.perplexity_score
                          )}
                        >
                          {analysisResult.ai_search_analysis.visibility_summary.perplexity_score}
                        </Badge>
                      </div>
                      <Progress
                        value={analysisResult.ai_search_analysis.visibility_summary.perplexity_score}
                        className="h-2"
                      />
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Gemini</span>
                        <Badge
                          className={getScoreBadgeColor(
                            analysisResult.ai_search_analysis.visibility_summary.gemini_score
                          )}
                        >
                          {analysisResult.ai_search_analysis.visibility_summary.gemini_score}
                        </Badge>
                      </div>
                      <Progress
                        value={analysisResult.ai_search_analysis.visibility_summary.gemini_score}
                        className="h-2"
                      />
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Claude</span>
                        <Badge
                          className={getScoreBadgeColor(
                            analysisResult.ai_search_analysis.visibility_summary.claude_score
                          )}
                        >
                          {analysisResult.ai_search_analysis.visibility_summary.claude_score}
                        </Badge>
                      </div>
                      <Progress
                        value={analysisResult.ai_search_analysis.visibility_summary.claude_score}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <AiSearchQueryTable queries={analysisResult.ai_search_analysis.search_queries_tested} />

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.ai_search_analysis.improvement_areas.map((area, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800 text-sm py-2 px-3">
                        {area.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {analysisResult && currentView === 'google-ecosystem' && (
            <div className="space-y-6">
              <GooglePresenceCards googlePresence={analysisResult.google_presence_detection} />

              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResult.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysisResult.guided_workflows && analysisResult.guided_workflows.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Guided Workflows</CardTitle>
                    <CardDescription>Automated optimization workflows available</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResult.guided_workflows.map((workflow, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                          <Zap className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{workflow}</p>
                          </div>
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                            Start
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {analysisResult && currentView === 'next-actions' && (
            <div className="space-y-6">
              <NextActionablesSection actionables={analysisResult.next_actionables} />
            </div>
          )}

          {!analysisResult && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">No analysis data available</p>
                <Button onClick={handleReanalyze} className="bg-[#00d4aa] hover:bg-teal-600">
                  Start Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col z-40">
          <div className="bg-[#1a1f36] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#00d4aa]" />
              <h3 className="font-semibold">AI-CRO Advisor</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Ask me about AI-search optimization and Google ecosystem improvements:
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => handleAnalyzeStore(analysisResult?.store_info?.website || '')}
                  className="w-full text-left text-sm p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  Re-analyze my store
                </button>
                <button className="w-full text-left text-sm p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                  Show AI-search optimization steps
                </button>
                <button className="w-full text-left text-sm p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                  Help me set up Google Merchant Center
                </button>
                <button className="w-full text-left text-sm p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                  How to improve agentic shopping readiness
                </button>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-slate-200">
            <div className="flex gap-2">
              <Input placeholder="Type your question..." />
              <Button className="bg-[#00d4aa] hover:bg-teal-600">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-[#00d4aa] hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-30"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
