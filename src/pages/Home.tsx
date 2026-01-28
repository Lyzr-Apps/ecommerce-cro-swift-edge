import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  LayoutDashboard,
  Plug,
  MessageSquare,
  Settings,
  Send,
  Loader2,
  Check,
  AlertCircle,
  ChevronRight,
  X,
  User,
  Menu,
  Brain,
  Search,
  Sparkles,
  MapPin,
  Star,
  ShoppingBag,
  TrendingUp,
  Zap,
  BarChart
} from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'

// Agent ID from test data
const AGENT_ID = "69797ab1a5d355f8aa48876f"

// TypeScript interfaces from REAL test data
interface PlatformVisibility {
  score: number
  findings: string[]
}

interface AiSearchAnalysis {
  overall_score: number
  visibility_by_platform: {
    chatgpt: PlatformVisibility
    perplexity: PlatformVisibility
    gemini: PlatformVisibility
    claude: PlatformVisibility
  }
  agentic_shopping_readiness: 'low' | 'medium' | 'high'
  key_issues: string[]
}

interface GoogleComponent {
  score: number
  status: string
  issues: string[]
}

interface GoogleEcosystemHealth {
  overall_score: number
  components: {
    google_maps: GoogleComponent
    google_reviews: GoogleComponent
    google_business_profile: GoogleComponent
    google_merchant_center: GoogleComponent
  }
}

interface Recommendation {
  category: 'ai_search' | 'google_maps' | 'google_reviews' | 'gbp' | 'gmc'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  automation_available: boolean
  expected_impact: string
}

interface GuidedWorkflow {
  workflow_name: string
  steps: string[]
  automated_steps: string[]
  manual_steps: string[]
  estimated_time: string
}

interface AutomationOpportunity {
  task: string
  platform: 'gmc' | 'gbp' | 'maps' | 'reviews' | 'ai_search'
  can_automate: boolean
  action: string
}

interface AgentResult {
  ai_search_analysis: AiSearchAnalysis
  google_ecosystem_health: GoogleEcosystemHealth
  recommendations: Recommendation[]
  guided_workflows: GuidedWorkflow[]
  automation_opportunities: AutomationOpportunity[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentResponse?: AgentResult
}

interface PosConnection {
  status: 'connected' | 'disconnected' | 'connecting'
  endpoint: string
  lastSync?: Date
}

interface GmcConnection {
  status: 'connected' | 'disconnected' | 'connecting'
  lastSync?: Date
}

type View = 'dashboard' | 'ai-search' | 'google-ecosystem' | 'integrations' | 'chat'

// Helper function to get score color
function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreBgColor(score: number): string {
  if (score >= 70) return 'bg-emerald-100 text-emerald-800'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

// Score card component
function ScoreCard({ title, score, icon: Icon, subtitle }: {
  title: string
  score: number
  icon: any
  subtitle?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Platform visibility card
function PlatformCard({ platform, data, icon: Icon }: {
  platform: string
  data: PlatformVisibility
  icon: any
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {platform}
          </CardTitle>
          <Badge className={getScoreBgColor(data.score)}>
            {data.score}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.findings.map((finding, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-600">{finding}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Google component card
function GoogleComponentCard({ name, data, onOptimize }: {
  name: string
  data: GoogleComponent
  onOptimize: () => void
}) {
  const icons: Record<string, any> = {
    'Google Maps': MapPin,
    'Google Reviews': Star,
    'Google Business Profile': ShoppingBag,
    'Google Merchant Center': ShoppingBag
  }
  const Icon = icons[name] || Settings

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {name}
          </CardTitle>
          <Badge className={getScoreBgColor(data.score)}>
            {data.score}
          </Badge>
        </div>
        <CardDescription>{data.status.replace(/_/g, ' ')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {data.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-600">{issue}</span>
            </div>
          ))}
        </div>
        <Button
          onClick={onOptimize}
          className="w-full bg-teal-500 hover:bg-teal-600"
          size="sm"
        >
          Optimize
        </Button>
      </CardContent>
    </Card>
  )
}

// Recommendation card component
function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const categoryColors: Record<string, string> = {
    ai_search: 'bg-blue-100 text-blue-800 border-blue-300',
    google_maps: 'bg-purple-100 text-purple-800 border-purple-300',
    google_reviews: 'bg-orange-100 text-orange-800 border-orange-300',
    gbp: 'bg-pink-100 text-pink-800 border-pink-300',
    gmc: 'bg-teal-100 text-teal-800 border-teal-300'
  }

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  return (
    <div className={`p-4 rounded-lg border ${categoryColors[recommendation.category]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge className={priorityColors[recommendation.priority]}>
            {recommendation.priority.toUpperCase()}
          </Badge>
          {recommendation.automation_available && (
            <Badge className="bg-teal-500 text-white">
              Auto
            </Badge>
          )}
        </div>
        <span className="text-xs font-medium">{recommendation.category}</span>
      </div>
      <h4 className="font-semibold text-sm mb-1">{recommendation.title}</h4>
      <p className="text-xs opacity-90 mb-2">{recommendation.description}</p>
      <p className="text-xs font-medium">Impact: {recommendation.expected_impact}</p>
    </div>
  )
}

// Connection status indicator
function ConnectionStatus({ status }: { status: 'connected' | 'disconnected' | 'connecting' }) {
  const colors = {
    connected: 'bg-emerald-500',
    disconnected: 'bg-red-500',
    connecting: 'bg-yellow-500'
  }

  const labels = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting...'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${colors[status]}`} />
      <span className="text-sm text-slate-600">{labels[status]}</span>
    </div>
  )
}

// Chat bubble component
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${isUser ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">{message.content}</p>
            {message.agentResponse && (
              <div className="space-y-4 mt-4">
                {/* AI-Search Analysis Section */}
                {message.agentResponse.ai_search_analysis && (
                  <div className="bg-white rounded p-3 text-slate-900">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-500" />
                      AI-Search Analysis
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Overall Score:</span>
                        <Badge className={getScoreBgColor(message.agentResponse.ai_search_analysis.overall_score)}>
                          {message.agentResponse.ai_search_analysis.overall_score}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Agentic Shopping:</span>
                        <Badge className={
                          message.agentResponse.ai_search_analysis.agentic_shopping_readiness === 'high'
                            ? 'bg-emerald-100 text-emerald-800'
                            : message.agentResponse.ai_search_analysis.agentic_shopping_readiness === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }>
                          {message.agentResponse.ai_search_analysis.agentic_shopping_readiness.toUpperCase()}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Platform Scores:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>ChatGPT:</span>
                            <Badge className={getScoreBgColor(message.agentResponse.ai_search_analysis.visibility_by_platform.chatgpt.score)} variant="outline">
                              {message.agentResponse.ai_search_analysis.visibility_by_platform.chatgpt.score}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Perplexity:</span>
                            <Badge className={getScoreBgColor(message.agentResponse.ai_search_analysis.visibility_by_platform.perplexity.score)} variant="outline">
                              {message.agentResponse.ai_search_analysis.visibility_by_platform.perplexity.score}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Gemini:</span>
                            <Badge className={getScoreBgColor(message.agentResponse.ai_search_analysis.visibility_by_platform.gemini.score)} variant="outline">
                              {message.agentResponse.ai_search_analysis.visibility_by_platform.gemini.score}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Claude:</span>
                            <Badge className={getScoreBgColor(message.agentResponse.ai_search_analysis.visibility_by_platform.claude.score)} variant="outline">
                              {message.agentResponse.ai_search_analysis.visibility_by_platform.claude.score}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Google Ecosystem Section */}
                {message.agentResponse.google_ecosystem_health && (
                  <div className="bg-white rounded p-3 text-slate-900">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Search className="h-4 w-4 text-orange-500" />
                      Google Ecosystem Health
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Overall Score:</span>
                        <Badge className={getScoreBgColor(message.agentResponse.google_ecosystem_health.overall_score)}>
                          {message.agentResponse.google_ecosystem_health.overall_score}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Maps:</span>
                          <Badge className={getScoreBgColor(message.agentResponse.google_ecosystem_health.components.google_maps.score)} variant="outline">
                            {message.agentResponse.google_ecosystem_health.components.google_maps.score}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Reviews:</span>
                          <Badge className={getScoreBgColor(message.agentResponse.google_ecosystem_health.components.google_reviews.score)} variant="outline">
                            {message.agentResponse.google_ecosystem_health.components.google_reviews.score}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Business Profile:</span>
                          <Badge className={getScoreBgColor(message.agentResponse.google_ecosystem_health.components.google_business_profile.score)} variant="outline">
                            {message.agentResponse.google_ecosystem_health.components.google_business_profile.score}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Merchant Center:</span>
                          <Badge className={getScoreBgColor(message.agentResponse.google_ecosystem_health.components.google_merchant_center.score)} variant="outline">
                            {message.agentResponse.google_ecosystem_health.components.google_merchant_center.score}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {message.agentResponse.recommendations && message.agentResponse.recommendations.length > 0 && (
                  <div className="bg-white rounded p-3 text-slate-900">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {message.agentResponse.recommendations.slice(0, 3).map((rec, i) => (
                        <div key={i} className="border rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={rec.priority === 'high' ? 'bg-red-100 text-red-800' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                              {rec.priority}
                            </Badge>
                            {rec.automation_available && (
                              <Badge className="bg-teal-500 text-white text-xs">Auto</Badge>
                            )}
                          </div>
                          <h5 className="font-semibold text-xs mb-1">{rec.title}</h5>
                          <p className="text-xs text-slate-600">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guided Workflows */}
                {message.agentResponse.guided_workflows && message.agentResponse.guided_workflows.length > 0 && (
                  <div className="bg-white rounded p-3 text-slate-900">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Guided Workflows
                    </h4>
                    <div className="space-y-2">
                      {message.agentResponse.guided_workflows.map((workflow, i) => (
                        <div key={i} className="border rounded p-2">
                          <h5 className="font-semibold text-xs mb-1">{workflow.workflow_name}</h5>
                          <p className="text-xs text-slate-500 mb-2">Time: {workflow.estimated_time}</p>
                          <div className="flex gap-2 text-xs">
                            <Badge className="bg-emerald-100 text-emerald-800">
                              {workflow.automated_steps.length} auto
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-800">
                              {workflow.manual_steps.length} manual
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Automation Opportunities */}
                {message.agentResponse.automation_opportunities && message.agentResponse.automation_opportunities.length > 0 && (
                  <div className="bg-white rounded p-3 text-slate-900">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-teal-500" />
                      Automation Opportunities
                    </h4>
                    <div className="space-y-2">
                      {message.agentResponse.automation_opportunities.filter(opp => opp.can_automate).map((opp, i) => (
                        <div key={i} className="border rounded p-2 bg-teal-50">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-semibold text-xs">{opp.task}</h5>
                            <Badge className="bg-teal-500 text-white text-xs">Auto</Badge>
                          </div>
                          <p className="text-xs text-slate-600">{opp.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastAgentResponse, setLastAgentResponse] = useState<AgentResult | null>(null)

  // Connection state
  const [posConnection, setPosConnection] = useState<PosConnection>({
    status: 'disconnected',
    endpoint: ''
  })
  const [gmcConnection, setGmcConnection] = useState<GmcConnection>({
    status: 'disconnected'
  })

  // PoS connection form
  const [posEndpoint, setPosEndpoint] = useState('')
  const [posApiKey, setPosApiKey] = useState('')

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage
    if (!textToSend.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      const result = await callAIAgent(textToSend, AGENT_ID)

      if (result.success && result.response.status === 'success') {
        const agentResponse = result.response.result as AgentResult
        setLastAgentResponse(agentResponse)

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here is your AI-search and Google ecosystem analysis:',
          timestamp: new Date(),
          agentResponse
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.error || 'Sorry, I encountered an error processing your request.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Network error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleConnectPos = () => {
    if (!posEndpoint.trim()) return
    setPosConnection(prev => ({ ...prev, status: 'connecting' }))

    setTimeout(() => {
      setPosConnection({
        status: 'connected',
        endpoint: posEndpoint,
        lastSync: new Date()
      })
    }, 1500)
  }

  const handleConnectGmc = () => {
    setGmcConnection(prev => ({ ...prev, status: 'connecting' }))

    setTimeout(() => {
      setGmcConnection({
        status: 'connected',
        lastSync: new Date()
      })
    }, 1500)
  }

  const suggestedPrompts = [
    "Analyze my AI-search visibility",
    "Check Google ecosystem health",
    "Show automation opportunities",
    "How to improve agentic shopping readiness"
  ]

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-teal-400">AI-CRO Advisor</h1>
        </div>
        <nav className="space-y-1 px-3">
          <button
            onClick={() => { setCurrentView('dashboard'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => { setCurrentView('ai-search'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'ai-search' ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Brain className="h-5 w-5" />
            <span>AI-Search Analysis</span>
          </button>
          <button
            onClick={() => { setCurrentView('google-ecosystem'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'google-ecosystem' ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Search className="h-5 w-5" />
            <span>Google Ecosystem</span>
          </button>
          <button
            onClick={() => { setCurrentView('integrations'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'integrations' ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Plug className="h-5 w-5" />
            <span>Integrations</span>
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
                {currentView === 'dashboard' ? 'Dashboard' :
                 currentView === 'ai-search' ? 'AI-Search Analysis' :
                 currentView === 'google-ecosystem' ? 'Google Ecosystem' :
                 currentView === 'integrations' ? 'Integrations' : 'Chat'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <div className={`h-2 w-2 rounded-full ${gmcConnection.status === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                <span className="text-sm text-slate-600">
                  {gmcConnection.status === 'connected' ? 'GMC Connected' : 'GMC Disconnected'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <User className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-600">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ScoreCard
                  title="AI-Search Score"
                  score={lastAgentResponse?.ai_search_analysis?.overall_score || 50}
                  icon={Brain}
                  subtitle="Overall visibility"
                />
                <ScoreCard
                  title="Google Ecosystem Score"
                  score={lastAgentResponse?.google_ecosystem_health?.overall_score || 57}
                  icon={Search}
                  subtitle="Combined health"
                />
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Agentic Shopping</CardTitle>
                    <Sparkles className="h-4 w-4 text-slate-500" />
                  </CardHeader>
                  <CardContent>
                    <Badge className={
                      lastAgentResponse?.ai_search_analysis?.agentic_shopping_readiness === 'high'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lastAgentResponse?.ai_search_analysis?.agentic_shopping_readiness === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }>
                      {(lastAgentResponse?.ai_search_analysis?.agentic_shopping_readiness || 'low').toUpperCase()}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">Readiness level</p>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Visibility Grid */}
              {lastAgentResponse?.ai_search_analysis?.visibility_by_platform && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Platform Visibility</CardTitle>
                    <CardDescription>Performance across AI search platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">ChatGPT</span>
                          <Badge className={getScoreBgColor(lastAgentResponse.ai_search_analysis.visibility_by_platform.chatgpt.score)}>
                            {lastAgentResponse.ai_search_analysis.visibility_by_platform.chatgpt.score}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Perplexity</span>
                          <Badge className={getScoreBgColor(lastAgentResponse.ai_search_analysis.visibility_by_platform.perplexity.score)}>
                            {lastAgentResponse.ai_search_analysis.visibility_by_platform.perplexity.score}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Gemini</span>
                          <Badge className={getScoreBgColor(lastAgentResponse.ai_search_analysis.visibility_by_platform.gemini.score)}>
                            {lastAgentResponse.ai_search_analysis.visibility_by_platform.gemini.score}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Claude</span>
                          <Badge className={getScoreBgColor(lastAgentResponse.ai_search_analysis.visibility_by_platform.claude.score)}>
                            {lastAgentResponse.ai_search_analysis.visibility_by_platform.claude.score}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Google Components Health Bar Chart */}
              {lastAgentResponse?.google_ecosystem_health?.components && (
                <Card>
                  <CardHeader>
                    <CardTitle>Google Components Health</CardTitle>
                    <CardDescription>Performance across Google services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(lastAgentResponse.google_ecosystem_health.components).map(([key, component]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <Badge className={getScoreBgColor(component.score)}>
                              {component.score}
                            </Badge>
                          </div>
                          <Progress value={component.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Recommendations Panel */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>AI Recommendations</CardTitle>
                    <CardDescription>Priority optimization opportunities</CardDescription>
                  </div>
                  <Button
                    onClick={() => setChatOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask AI
                  </Button>
                </CardHeader>
                <CardContent>
                  {lastAgentResponse && lastAgentResponse.recommendations && lastAgentResponse.recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {lastAgentResponse.recommendations
                        .sort((a, b) => {
                          const priority = { high: 0, medium: 1, low: 2 }
                          return priority[a.priority] - priority[b.priority]
                        })
                        .slice(0, 5)
                        .map((rec, i) => (
                          <RecommendationCard key={i} recommendation={rec} />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500 mb-4">No analysis yet</p>
                      <Button
                        onClick={() => {
                          setChatOpen(true)
                          setTimeout(() => {
                            handleSendMessage("Analyze my store's AI-search visibility and Google shopping ecosystem health.")
                          }, 500)
                        }}
                        variant="outline"
                        className="border-teal-500 text-teal-600 hover:bg-teal-50"
                      >
                        Get AI Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === 'ai-search' && (
            <div className="space-y-6">
              {lastAgentResponse?.ai_search_analysis ? (
                <>
                  {/* Overall AI-Search Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Search Visibility Overview</CardTitle>
                      <CardDescription>Your visibility across AI search platforms</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-700">Overall Score</span>
                        <div className={`text-4xl font-bold ${getScoreColor(lastAgentResponse.ai_search_analysis.overall_score)}`}>
                          {lastAgentResponse.ai_search_analysis.overall_score}
                        </div>
                      </div>
                      <Progress value={lastAgentResponse.ai_search_analysis.overall_score} className="h-3" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Agentic Shopping Readiness:</span>
                        <Badge className={
                          lastAgentResponse.ai_search_analysis.agentic_shopping_readiness === 'high'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lastAgentResponse.ai_search_analysis.agentic_shopping_readiness === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }>
                          {lastAgentResponse.ai_search_analysis.agentic_shopping_readiness.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Platform Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PlatformCard
                      platform="ChatGPT"
                      data={lastAgentResponse.ai_search_analysis.visibility_by_platform.chatgpt}
                      icon={MessageSquare}
                    />
                    <PlatformCard
                      platform="Perplexity"
                      data={lastAgentResponse.ai_search_analysis.visibility_by_platform.perplexity}
                      icon={Search}
                    />
                    <PlatformCard
                      platform="Gemini"
                      data={lastAgentResponse.ai_search_analysis.visibility_by_platform.gemini}
                      icon={Sparkles}
                    />
                    <PlatformCard
                      platform="Claude"
                      data={lastAgentResponse.ai_search_analysis.visibility_by_platform.claude}
                      icon={Brain}
                    />
                  </div>

                  {/* Key Issues */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Issues</CardTitle>
                      <CardDescription>Critical items to address</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lastAgentResponse.ai_search_analysis.key_issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-900">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No AI-search analysis available</p>
                    <Button
                      onClick={() => {
                        setChatOpen(true)
                        setTimeout(() => {
                          handleSendMessage("Analyze my AI-search visibility")
                        }, 500)
                      }}
                      className="bg-teal-500 hover:bg-teal-600"
                    >
                      Analyze Now
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentView === 'google-ecosystem' && (
            <div className="space-y-6">
              {lastAgentResponse?.google_ecosystem_health ? (
                <>
                  {/* Overall Ecosystem Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Google Ecosystem Health</CardTitle>
                      <CardDescription>Your presence across Google services</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-700">Overall Score</span>
                        <div className={`text-4xl font-bold ${getScoreColor(lastAgentResponse.google_ecosystem_health.overall_score)}`}>
                          {lastAgentResponse.google_ecosystem_health.overall_score}
                        </div>
                      </div>
                      <Progress value={lastAgentResponse.google_ecosystem_health.overall_score} className="h-3" />
                    </CardContent>
                  </Card>

                  {/* Component Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GoogleComponentCard
                      name="Google Maps"
                      data={lastAgentResponse.google_ecosystem_health.components.google_maps}
                      onOptimize={() => {
                        setChatOpen(true)
                        setTimeout(() => handleSendMessage("How can I optimize my Google Maps listing?"), 500)
                      }}
                    />
                    <GoogleComponentCard
                      name="Google Reviews"
                      data={lastAgentResponse.google_ecosystem_health.components.google_reviews}
                      onOptimize={() => {
                        setChatOpen(true)
                        setTimeout(() => handleSendMessage("Help me improve my Google Reviews strategy"), 500)
                      }}
                    />
                    <GoogleComponentCard
                      name="Google Business Profile"
                      data={lastAgentResponse.google_ecosystem_health.components.google_business_profile}
                      onOptimize={() => {
                        setChatOpen(true)
                        setTimeout(() => handleSendMessage("Optimize my Google Business Profile"), 500)
                      }}
                    />
                    <GoogleComponentCard
                      name="Google Merchant Center"
                      data={lastAgentResponse.google_ecosystem_health.components.google_merchant_center}
                      onOptimize={() => {
                        setChatOpen(true)
                        setTimeout(() => handleSendMessage("How to fix my Google Merchant Center feed?"), 500)
                      }}
                    />
                  </div>

                  {/* Guided Workflows */}
                  {lastAgentResponse.guided_workflows && lastAgentResponse.guided_workflows.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Guided Workflows</CardTitle>
                        <CardDescription>Step-by-step optimization guides</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {lastAgentResponse.guided_workflows.map((workflow, i) => (
                            <AccordionItem key={i} value={`item-${i}`}>
                              <AccordionTrigger className="text-sm font-medium">
                                {workflow.workflow_name}
                                <Badge className="ml-2 bg-slate-100 text-slate-800">
                                  {workflow.estimated_time}
                                </Badge>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3 pt-2">
                                  <div className="flex gap-2">
                                    <Badge className="bg-emerald-100 text-emerald-800">
                                      {workflow.automated_steps.length} Automated
                                    </Badge>
                                    <Badge className="bg-slate-100 text-slate-800">
                                      {workflow.manual_steps.length} Manual
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    {workflow.steps.map((step, j) => (
                                      <div key={j} className="flex items-start gap-2 text-sm">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                          workflow.automated_steps.some(s => step.includes(s.substring(0, 15)))
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-100 text-slate-800'
                                        }`}>
                                          {j + 1}
                                        </div>
                                        <span className="text-slate-700 pt-0.5">{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  )}

                  {/* Automation Queue */}
                  {lastAgentResponse.automation_opportunities && lastAgentResponse.automation_opportunities.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Automation Opportunities</CardTitle>
                        <CardDescription>Tasks that can be automated</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {lastAgentResponse.automation_opportunities
                            .filter(opp => opp.can_automate)
                            .map((opp, i) => (
                              <div key={i} className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-sm text-slate-900">{opp.task}</h4>
                                      <Badge className="bg-teal-500 text-white">Auto</Badge>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-2">{opp.action}</p>
                                    <Badge className="bg-slate-100 text-slate-800 text-xs">
                                      {opp.platform.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Automate
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No Google ecosystem analysis available</p>
                    <Button
                      onClick={() => {
                        setChatOpen(true)
                        setTimeout(() => {
                          handleSendMessage("Check Google ecosystem health")
                        }, 500)
                      }}
                      className="bg-teal-500 hover:bg-teal-600"
                    >
                      Analyze Now
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentView === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GMC Connection - PRIMARY */}
              <Card className="border-2 border-teal-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Google Merchant Center</CardTitle>
                      <CardDescription>Primary integration - Sync product feed</CardDescription>
                    </div>
                    <Badge className="bg-teal-500 text-white">PRIMARY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ConnectionStatus status={gmcConnection.status} />

                  {gmcConnection.status === 'disconnected' && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                          OAuth authentication will be handled automatically by the agent when you connect.
                        </p>
                      </div>
                      <Button
                        onClick={handleConnectGmc}
                        className="w-full bg-teal-500 hover:bg-teal-600"
                      >
                        Connect GMC
                      </Button>
                    </div>
                  )}

                  {gmcConnection.status === 'connecting' && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                    </div>
                  )}

                  {gmcConnection.status === 'connected' && (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-emerald-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-emerald-900">Connected Successfully</p>
                            <p className="text-xs text-emerald-700 mt-1">Account: merchant@example.com</p>
                            {gmcConnection.lastSync && (
                              <p className="text-xs text-emerald-700 mt-1">
                                Last sync: {gmcConnection.lastSync.toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-teal-500 hover:bg-teal-600"
                          onClick={() => {
                            setChatOpen(true)
                            setTimeout(() => handleSendMessage("Automate GMC feed optimization"), 500)
                          }}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Automate GMC
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setGmcConnection({ status: 'disconnected' })}
                          className="w-full"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Google Business Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Google Business Profile</CardTitle>
                  <CardDescription>Manage your business listing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-600">Connected</span>
                  </div>
                  {lastAgentResponse?.google_ecosystem_health?.components.google_business_profile && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Optimization Score</span>
                        <Badge className={getScoreBgColor(lastAgentResponse.google_ecosystem_health.components.google_business_profile.score)}>
                          {lastAgentResponse.google_ecosystem_health.components.google_business_profile.score}
                        </Badge>
                      </div>
                      <Progress value={lastAgentResponse.google_ecosystem_health.components.google_business_profile.score} className="h-2" />
                    </div>
                  )}
                  <Button
                    className="w-full bg-teal-500 hover:bg-teal-600"
                    onClick={() => setCurrentView('google-ecosystem')}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>

              {/* Google Maps */}
              <Card>
                <CardHeader>
                  <CardTitle>Google Maps</CardTitle>
                  <CardDescription>Local search visibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-600">Listing Active</span>
                  </div>
                  {lastAgentResponse?.google_ecosystem_health?.components.google_maps && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Score</span>
                        <Badge className={getScoreBgColor(lastAgentResponse.google_ecosystem_health.components.google_maps.score)}>
                          {lastAgentResponse.google_ecosystem_health.components.google_maps.score}
                        </Badge>
                      </div>
                      <Progress value={lastAgentResponse.google_ecosystem_health.components.google_maps.score} className="h-2" />
                    </div>
                  )}
                  <Button
                    className="w-full bg-teal-500 hover:bg-teal-600"
                    onClick={() => setCurrentView('google-ecosystem')}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>

              {/* PoS Connection - SECONDARY */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Point of Sale Integration</CardTitle>
                      <CardDescription>Universal Adapter - Connect any PoS</CardDescription>
                    </div>
                    <Badge className="bg-slate-500 text-white">SECONDARY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ConnectionStatus status={posConnection.status} />

                  {posConnection.status === 'disconnected' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="posEndpoint">API Endpoint</Label>
                        <Input
                          id="posEndpoint"
                          value={posEndpoint}
                          onChange={(e) => setPosEndpoint(e.target.value)}
                          placeholder="https://api.yourpos.com/v1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="posApiKey">API Key</Label>
                        <Input
                          id="posApiKey"
                          type="password"
                          value={posApiKey}
                          onChange={(e) => setPosApiKey(e.target.value)}
                          placeholder="Enter your API key"
                        />
                      </div>
                      <Button
                        onClick={handleConnectPos}
                        className="w-full bg-slate-600 hover:bg-slate-700"
                        disabled={!posEndpoint.trim()}
                      >
                        Connect PoS
                      </Button>
                    </div>
                  )}

                  {posConnection.status === 'connecting' && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    </div>
                  )}

                  {posConnection.status === 'connected' && (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-emerald-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-emerald-900">Connected Successfully</p>
                            <p className="text-xs text-emerald-700 mt-1">Endpoint: {posConnection.endpoint}</p>
                            {posConnection.lastSync && (
                              <p className="text-xs text-emerald-700 mt-1">
                                Last sync: {posConnection.lastSync.toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setPosConnection({ status: 'disconnected', endpoint: '' })}
                        className="w-full"
                      >
                        Disconnect
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col z-40">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-400" />
              <h3 className="font-semibold">AI-CRO Advisor</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className={`h-2 w-2 rounded-full ${gmcConnection.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>GMC</span>
              <div className={`h-2 w-2 rounded-full ${posConnection.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>PoS</span>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">Ask me about AI-search visibility and Google ecosystem optimization:</p>
                <div className="space-y-2">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={loading}
                      className="w-full text-left text-sm p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => <ChatBubble key={msg.id} message={msg} />)
            )}
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-slate-200">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                disabled={loading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="bg-teal-500 hover:bg-teal-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button (when chat is closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-30"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
