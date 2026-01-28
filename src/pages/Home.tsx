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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  MapPin,
  Settings,
  Bot,
  Shield,
  Play,
  Pause,
  Clock,
  Type,
  Tag,
  Image,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Eye,
  ChevronDown,
  ChevronUp
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
  agentic_shopping_readiness: string
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

// NEW GMC Control interfaces from test response
interface GmcControlStatus {
  permission_granted: boolean
  last_sync: string
  automation_mode: 'off' | 'review' | 'auto'
  changes_pending_approval: number
}

interface OptimizationCategory {
  count: number
  status: 'pending' | 'in_progress' | 'completed'
}

interface GmcOptimizationPlan {
  total_optimizations: number
  by_category: {
    product_titles: OptimizationCategory
    missing_attributes: OptimizationCategory
    image_optimization: OptimizationCategory
    policy_fixes: OptimizationCategory
    feed_errors: OptimizationCategory
  }
}

interface AutonomousAction {
  timestamp: string
  action_type: string
  target: string
  before: string
  after: string
  status: 'completed' | 'failed' | 'pending_approval' | 'reverted'
  impact_estimate: string
  can_rollback: boolean
}

interface OptimizationQueueItem {
  priority: number
  optimization_type: string
  products_affected: number
  estimated_time: string
  auto_execute: boolean
  requires_approval: boolean
  status: 'queued' | 'running' | 'paused'
}

interface PermissionRequest {
  requesting: boolean
  scope: string
  actions_planned: string[]
  estimated_improvements: string
  user_approval_required: boolean
}

interface NextActionable {
  priority: number
  action: string
  category: string
  impact: string
  automation_available: boolean
  estimated_time: string
  steps: string[]
  can_start_now: boolean
}

interface AgentResult {
  store_info: StoreInfo
  ai_search_analysis: AiSearchAnalysis
  google_presence_detection: GooglePresenceDetection
  gmc_control_status: GmcControlStatus
  gmc_optimization_plan: GmcOptimizationPlan
  autonomous_actions_taken: AutonomousAction[]
  optimization_queue: OptimizationQueueItem[]
  permission_request: PermissionRequest
  next_actionables: NextActionable[]
  recommendations?: string[]
  guided_workflows?: string[]
}

type View = 'onboarding' | 'dashboard' | 'ai-search' | 'google-ecosystem' | 'next-actions' | 'gmc-optimization' | 'actions-history' | 'chat'

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

function getOptimizationIcon(type: string) {
  switch (type) {
    case 'product_titles':
    case 'title_optimization':
      return <Type className="h-4 w-4" />
    case 'missing_attributes':
    case 'attribute_fix':
      return <Tag className="h-4 w-4" />
    case 'image_optimization':
      return <Image className="h-4 w-4" />
    case 'policy_fixes':
      return <AlertTriangle className="h-4 w-4" />
    case 'feed_errors':
      return <XCircle className="h-4 w-4" />
    default:
      return <Settings className="h-4 w-4" />
  }
}

// Permission Request Modal Component
function PermissionRequestModal({
  open,
  permissionRequest,
  onGrant,
  onDismiss
}: {
  open: boolean
  permissionRequest: PermissionRequest
  onGrant: (mode: 'review' | 'auto') => void
  onDismiss: () => void
}) {
  const [automationMode, setAutomationMode] = useState<'review' | 'auto'>('review')
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onDismiss}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Aimpler Wants to Optimize Your Google Merchant Center
              </DialogTitle>
              <Badge className="mt-1 bg-teal-100 text-teal-800">
                <Shield className="h-3 w-3 mr-1" />
                {permissionRequest.scope.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* What Aimpler Will Do */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">What Aimpler Will Do:</h3>
            <div className="space-y-2">
              {permissionRequest.actions_planned.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Impact */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Expected Impact
            </h3>
            <p className="text-sm text-emerald-800">{permissionRequest.estimated_improvements}</p>
          </div>

          {/* Automation Mode Selection */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Choose Automation Mode:</h3>
            <RadioGroup value={automationMode} onValueChange={(val) => setAutomationMode(val as 'review' | 'auto')}>
              <div className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="review" id="review" />
                <Label htmlFor="review" className="cursor-pointer flex-1">
                  <div className="font-medium text-slate-900 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-yellow-500" />
                    Review Required
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    I approve each change before it's applied
                  </p>
                </Label>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 mt-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="cursor-pointer flex-1">
                  <div className="font-medium text-slate-900 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-teal-500" />
                    Fully Automated
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Apply optimizations automatically and notify me
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Details Expander */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="font-medium text-slate-900">View Detailed Action Plan</span>
            {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {showDetails && (
            <div className="border rounded-lg p-4 space-y-2">
              <p className="text-sm text-slate-700">
                Detailed optimization steps and technical implementation will be shown here after approval.
              </p>
            </div>
          )}

          {/* Safety Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-600">
              <Shield className="h-3 w-3 inline mr-1" />
              You can revoke access or rollback changes anytime
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={onDismiss}>
            Not Now
          </Button>
          <Button
            className="bg-teal-500 hover:bg-teal-600"
            onClick={() => onGrant(automationMode)}
          >
            <Shield className="h-4 w-4 mr-2" />
            Grant Access & Start Optimizing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// GMC Control Status Widget Component
function GmcControlStatusWidget({
  controlStatus,
  onManageSettings,
  onEnableControl
}: {
  controlStatus: GmcControlStatus
  onManageSettings: () => void
  onEnableControl: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        <Settings className="h-5 w-5 text-slate-500" />
        <div>
          <div className="flex items-center gap-2">
            {controlStatus.permission_granted ? (
              <>
                <Badge className="bg-teal-100 text-teal-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Control: Active
                </Badge>
                <Badge className={controlStatus.automation_mode === 'auto' ? 'bg-teal-500 text-white' : 'bg-yellow-100 text-yellow-800'}>
                  {controlStatus.automation_mode === 'auto' ? (
                    <>
                      <Zap className="h-3 w-3 mr-1" />
                      Auto
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Review
                    </>
                  )}
                </Badge>
              </>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">
                Control: Off
              </Badge>
            )}
          </div>
          {controlStatus.permission_granted && (
            <p className="text-xs text-slate-600 mt-1">
              {controlStatus.changes_pending_approval > 0 && `${controlStatus.changes_pending_approval} pending approval • `}
              Last sync: {controlStatus.last_sync || 'Never'}
            </p>
          )}
        </div>
      </div>
      {controlStatus.permission_granted ? (
        <Button size="sm" variant="outline" onClick={onManageSettings}>
          Manage
        </Button>
      ) : (
        <Button size="sm" className="bg-teal-500 hover:bg-teal-600" onClick={onEnableControl}>
          Enable AI Control
        </Button>
      )}
    </div>
  )
}

// Optimization Dashboard Component
function OptimizationDashboard({
  controlStatus,
  optimizationPlan,
  onPauseResume,
  onCategoryClick
}: {
  controlStatus: GmcControlStatus
  optimizationPlan: GmcOptimizationPlan
  onPauseResume: () => void
  onCategoryClick: (category: string) => void
}) {
  const categories = [
    { key: 'product_titles', label: 'Product Titles', icon: Type, color: 'text-blue-600' },
    { key: 'missing_attributes', label: 'Missing Attributes', icon: Tag, color: 'text-purple-600' },
    { key: 'image_optimization', label: 'Image Optimization', icon: Image, color: 'text-green-600' },
    { key: 'policy_fixes', label: 'Policy Fixes', icon: AlertTriangle, color: 'text-orange-600' },
    { key: 'feed_errors', label: 'Feed Errors', icon: XCircle, color: 'text-red-600' }
  ]

  const totalCompleted = Object.values(optimizationPlan.by_category).filter(
    cat => cat.status === 'completed'
  ).reduce((sum, cat) => sum + cat.count, 0)

  const totalInProgress = Object.values(optimizationPlan.by_category).filter(
    cat => cat.status === 'in_progress'
  ).reduce((sum, cat) => sum + cat.count, 0)

  const totalPending = Object.values(optimizationPlan.by_category).filter(
    cat => cat.status === 'pending'
  ).reduce((sum, cat) => sum + cat.count, 0)

  const progressPercentage = optimizationPlan.total_optimizations > 0
    ? (totalCompleted / optimizationPlan.total_optimizations) * 100
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>GMC Optimization Center</CardTitle>
            <CardDescription>
              {controlStatus.permission_granted ? (
                <span className="text-teal-600">Autonomous control enabled</span>
              ) : (
                <span className="text-yellow-600">Awaiting permission</span>
              )}
            </CardDescription>
          </div>
          {controlStatus.permission_granted && (
            <Button
              size="sm"
              variant="outline"
              onClick={onPauseResume}
              className="border-teal-500 text-teal-600"
            >
              {controlStatus.automation_mode === 'off' ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{optimizationPlan.total_optimizations}</p>
            <p className="text-xs text-slate-600 mt-1">Total Planned</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{totalCompleted}</p>
            <p className="text-xs text-slate-600 mt-1">Completed</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{totalInProgress}</p>
            <p className="text-xs text-slate-600 mt-1">In Progress</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
            <p className="text-xs text-slate-600 mt-1">Pending</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Progress</span>
            <span className="text-sm font-bold text-slate-900">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Category Breakdown */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 mb-3">Optimization Categories</h4>
          {categories.map(({ key, label, icon: Icon, color }) => {
            const category = optimizationPlan.by_category[key as keyof typeof optimizationPlan.by_category]
            return (
              <button
                key={key}
                onClick={() => onCategoryClick(key)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="font-medium text-slate-900">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      category.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : category.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {category.count} {category.status.replace(/_/g, ' ')}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Optimization Queue Component
function OptimizationQueue({ queue }: { queue: OptimizationQueueItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Queue</CardTitle>
        <CardDescription>{queue.length} items in queue</CardDescription>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No optimizations queued</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue
              .sort((a, b) => a.priority - b.priority)
              .map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        #{item.priority}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getOptimizationIcon(item.optimization_type)}
                          <h4 className="font-semibold text-sm">
                            {item.optimization_type.replace(/_/g, ' ')}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="outline" className="text-xs">
                            {item.products_affected} products
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.estimated_time}
                          </Badge>
                          {item.auto_execute && (
                            <Badge className="bg-teal-500 text-white text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto-execute
                            </Badge>
                          )}
                          <Badge
                            className={
                              item.status === 'running'
                                ? 'bg-blue-100 text-blue-800 text-xs'
                                : item.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-800 text-xs'
                                : 'bg-slate-100 text-slate-800 text-xs'
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {item.requires_approval && (
                        <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                          Review & Approve
                        </Button>
                      )}
                      {item.status === 'running' && (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {item.status === 'running' && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Executing optimization...</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Actions History Component
function ActionsHistory({ actions }: { actions: AutonomousAction[] }) {
  const [expandedActions, setExpandedActions] = useState<number[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const toggleExpand = (idx: number) => {
    setExpandedActions(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const filteredActions = filterStatus === 'all'
    ? actions
    : actions.filter(action => action.status === filterStatus)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Actions History</CardTitle>
            <CardDescription>{actions.length} autonomous actions recorded</CardDescription>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Actions</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="reverted">Reverted</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No actions recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActions.map((action, idx) => (
              <div key={idx} className="border rounded-lg">
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 text-left">
                    {getOptimizationIcon(action.action_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{action.action_type.replace(/_/g, ' ')}</span>
                        <Badge
                          className={
                            action.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : action.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : action.status === 'reverted'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {action.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock className="h-3 w-3" />
                        <span>{action.timestamp}</span>
                        <span className="mx-2">•</span>
                        <span>Target: {action.target}</span>
                      </div>
                    </div>
                  </div>
                  {expandedActions.includes(idx) ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {expandedActions.includes(idx) && (
                  <div className="border-t p-4 space-y-3 bg-slate-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">Before:</p>
                        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-slate-900">
                          {action.before}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">After:</p>
                        <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-xs text-slate-900">
                          {action.after}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Impact Estimate:</p>
                      <p className="text-xs text-blue-800">{action.impact_estimate}</p>
                    </div>

                    {action.can_rollback && action.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Rollback This Change
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Automation Settings Modal Component
function AutomationSettingsModal({
  open,
  controlStatus,
  onClose,
  onSave,
  onRevoke
}: {
  open: boolean
  controlStatus: GmcControlStatus
  onClose: () => void
  onSave: (settings: any) => void
  onRevoke: () => void
}) {
  const [automationMode, setAutomationMode] = useState(controlStatus.automation_mode)
  const [categories, setCategories] = useState({
    product_titles: true,
    missing_attributes: true,
    image_optimization: true,
    policy_fixes: true,
    feed_errors: true
  })

  const handleSave = () => {
    onSave({ automation_mode: automationMode, categories })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Automation Settings</DialogTitle>
          <DialogDescription>Configure GMC optimization automation preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Automation Mode */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Automation Mode</h3>
            <RadioGroup value={automationMode} onValueChange={(val) => setAutomationMode(val as any)}>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <RadioGroupItem value="off" id="mode-off" />
                  <Label htmlFor="mode-off" className="flex-1 cursor-pointer">
                    <div className="font-medium">Off - No automatic optimizations</div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <RadioGroupItem value="review" id="mode-review" />
                  <Label htmlFor="mode-review" className="flex-1 cursor-pointer">
                    <div className="font-medium">Review Required - Approve each change</div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <RadioGroupItem value="auto" id="mode-auto" />
                  <Label htmlFor="mode-auto" className="flex-1 cursor-pointer">
                    <div className="font-medium">Fully Automated - Auto-apply all optimizations</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Optimization Categories */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Optimization Categories</h3>
            <div className="space-y-2">
              {Object.keys(categories).map((key) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor={key} className="cursor-pointer">
                    {key.replace(/_/g, ' ')}
                  </Label>
                  <Switch
                    id={key}
                    checked={categories[key as keyof typeof categories]}
                    onCheckedChange={(checked) =>
                      setCategories(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Safety Controls */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-slate-900 mb-3">Safety Controls</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-red-500 text-red-600 hover:bg-red-50"
                onClick={onRevoke}
              >
                <Shield className="h-4 w-4 mr-2" />
                Revoke GMC Access
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-teal-500 hover:bg-teal-600" onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Updated GMC Card with Control Status
function UpdatedGmcCard({
  gmc,
  controlStatus,
  optimizationPlan,
  onEnableControl,
  onViewProgress,
  onManageSettings
}: {
  gmc: GoogleMerchantCenter
  controlStatus: GmcControlStatus
  optimizationPlan: GmcOptimizationPlan
  onEnableControl: () => void
  onViewProgress: () => void
  onManageSettings: () => void
}) {
  const completedToday = 0 // Would be calculated from actions
  const runningCount = Object.values(optimizationPlan.by_category).filter(
    cat => cat.status === 'in_progress'
  ).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-teal-500" />
            Google Merchant Center
          </CardTitle>
          <div className="flex items-center gap-2">
            {controlStatus.permission_granted ? (
              <>
                <Badge className="bg-teal-100 text-teal-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  AI Control: Active
                </Badge>
                <Badge className={controlStatus.automation_mode === 'auto' ? 'bg-teal-500 text-white' : 'bg-yellow-100 text-yellow-800'}>
                  {controlStatus.automation_mode === 'auto' ? 'Auto' : 'Review'}
                </Badge>
              </>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">
                AI Control: Disabled
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {controlStatus.permission_granted ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{runningCount}</p>
                <p className="text-xs text-slate-600 mt-1">Running</p>
              </div>
              <div className="bg-emerald-50 rounded p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{completedToday}</p>
                <p className="text-xs text-slate-600 mt-1">Completed Today</p>
              </div>
              <div className="bg-yellow-50 rounded p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{controlStatus.changes_pending_approval}</p>
                <p className="text-xs text-slate-600 mt-1">Pending Review</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-teal-500 hover:bg-teal-600" onClick={onViewProgress}>
                View Progress
              </Button>
              <Button variant="outline" onClick={onManageSettings}>
                Manage
              </Button>
            </div>
          </>
        ) : (
          <>
            {optimizationPlan.total_optimizations > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-sm font-medium text-teal-900">
                  {optimizationPlan.total_optimizations} optimizations available
                </p>
              </div>
            )}
            <Button className="w-full bg-teal-500 hover:bg-teal-600" onClick={onEnableControl}>
              <Zap className="h-4 w-4 mr-2" />
              Enable AI Optimization
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
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
              <CardTitle className="text-xl">{storeInfo.business_name || 'Your Store'}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {storeInfo.website && (
                  <a
                    href={storeInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline flex items-center gap-1"
                  >
                    {storeInfo.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                {storeInfo.detected_category && (
                  <Badge variant="outline">{storeInfo.detected_category}</Badge>
                )}
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
  if (!queries || queries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Search Query Results</CardTitle>
          <CardDescription>No query data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

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

  // GMC Control state
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Check if user has completed onboarding
  useEffect(() => {
    const completed = localStorage.getItem('aimpler_onboarding_complete')
    if (completed === 'true') {
      setOnboardingComplete(true)
      setCurrentView('dashboard')
    }
  }, [])

  // Check for permission request after analysis
  useEffect(() => {
    if (analysisResult?.permission_request?.requesting) {
      setShowPermissionModal(true)
    }
  }, [analysisResult])

  const handleAnalyzeStore = async (storeUrl: string) => {
    setLoading(true)
    try {
      const message = `Analyze my store: ${storeUrl}`
      const result = await callAIAgent(message, AGENT_ID)

      if (result.success && result.response.status === 'success') {
        const agentResult = result.response.result as AgentResult
        setAnalysisResult(agentResult)
        setOnboardingComplete(true)
        localStorage.setItem('aimpler_onboarding_complete', 'true')
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

  const handleGrantPermission = async (mode: 'review' | 'auto') => {
    // Update local state
    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        gmc_control_status: {
          ...analysisResult.gmc_control_status,
          permission_granted: true,
          automation_mode: mode,
          last_sync: new Date().toISOString()
        },
        permission_request: {
          ...analysisResult.permission_request,
          requesting: false
        }
      })
    }
    setShowPermissionModal(false)

    // In real implementation, would call agent to grant permission
    // const result = await callAIAgent(`Grant GMC control with ${mode} mode`, AGENT_ID)
  }

  const handleRevokePermission = () => {
    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        gmc_control_status: {
          ...analysisResult.gmc_control_status,
          permission_granted: false,
          automation_mode: 'off'
        }
      })
    }
    setShowSettingsModal(false)
  }

  const handlePauseResume = () => {
    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        gmc_control_status: {
          ...analysisResult.gmc_control_status,
          automation_mode: analysisResult.gmc_control_status.automation_mode === 'off' ? 'review' : 'off'
        }
      })
    }
  }

  // Show onboarding if not complete
  if (!onboardingComplete) {
    return <OnboardingScreen onAnalyze={handleAnalyzeStore} loading={loading} />
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Permission Request Modal */}
      {analysisResult?.permission_request && (
        <PermissionRequestModal
          open={showPermissionModal}
          permissionRequest={analysisResult.permission_request}
          onGrant={handleGrantPermission}
          onDismiss={() => setShowPermissionModal(false)}
        />
      )}

      {/* Automation Settings Modal */}
      {analysisResult?.gmc_control_status && (
        <AutomationSettingsModal
          open={showSettingsModal}
          controlStatus={analysisResult.gmc_control_status}
          onClose={() => setShowSettingsModal(false)}
          onSave={(settings) => {
            if (analysisResult) {
              setAnalysisResult({
                ...analysisResult,
                gmc_control_status: {
                  ...analysisResult.gmc_control_status,
                  automation_mode: settings.automation_mode
                }
              })
            }
          }}
          onRevoke={handleRevokePermission}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-[#1a1f36] text-white transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-[#00d4aa]">Aimpler</h1>
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
            onClick={() => { setCurrentView('gmc-optimization'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'gmc-optimization'
                ? 'bg-[#00d4aa] text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>GMC Optimization</span>
          </button>
          <button
            onClick={() => { setCurrentView('actions-history'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'actions-history'
                ? 'bg-[#00d4aa] text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span>Actions History</span>
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
                  : currentView === 'gmc-optimization'
                  ? 'GMC Optimization Center'
                  : currentView === 'actions-history'
                  ? 'Actions History'
                  : currentView === 'next-actions'
                  ? 'Next Actions'
                  : 'Chat'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {analysisResult?.gmc_control_status && (
                <GmcControlStatusWidget
                  controlStatus={analysisResult.gmc_control_status}
                  onManageSettings={() => setShowSettingsModal(true)}
                  onEnableControl={() => setShowPermissionModal(true)}
                />
              )}
              <Button
                onClick={() => setChatOpen(true)}
                className="bg-[#00d4aa] hover:bg-teal-600"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {analysisResult && currentView === 'dashboard' && (
            <div className="space-y-6">
              <StoreInfoCard storeInfo={analysisResult.store_info} onReanalyze={handleReanalyze} />
              <MetricsGrid result={analysisResult} />
              {analysisResult.gmc_control_status && analysisResult.gmc_optimization_plan && (
                <UpdatedGmcCard
                  gmc={analysisResult.google_presence_detection.google_merchant_center}
                  controlStatus={analysisResult.gmc_control_status}
                  optimizationPlan={analysisResult.gmc_optimization_plan}
                  onEnableControl={() => setShowPermissionModal(true)}
                  onViewProgress={() => setCurrentView('gmc-optimization')}
                  onManageSettings={() => setShowSettingsModal(true)}
                />
              )}
              <AiSearchQueryTable queries={analysisResult.ai_search_analysis.search_queries_tested} />
              <GooglePresenceCards googlePresence={analysisResult.google_presence_detection} />
              <NextActionablesSection actionables={analysisResult.next_actionables} />
            </div>
          )}

          {analysisResult && currentView === 'gmc-optimization' && (
            <div className="space-y-6">
              {analysisResult.gmc_control_status && analysisResult.gmc_optimization_plan && (
                <>
                  <OptimizationDashboard
                    controlStatus={analysisResult.gmc_control_status}
                    optimizationPlan={analysisResult.gmc_optimization_plan}
                    onPauseResume={handlePauseResume}
                    onCategoryClick={(category) => console.log('Category clicked:', category)}
                  />
                  <OptimizationQueue queue={analysisResult.optimization_queue} />
                </>
              )}
            </div>
          )}

          {analysisResult && currentView === 'actions-history' && (
            <div className="space-y-6">
              <ActionsHistory actions={analysisResult.autonomous_actions_taken} />
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

              {analysisResult.ai_search_analysis.improvement_areas.length > 0 && (
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
              )}
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
              <h3 className="font-semibold">Aimpler</h3>
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
                  Show me what you've optimized
                </button>
                <button className="w-full text-left text-sm p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                  Approve pending changes
                </button>
                <button className="w-full text-left text-sm p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                  Run product title optimization
                </button>
                <button className="w-full text-left text-sm p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                  Fix all feed errors automatically
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
