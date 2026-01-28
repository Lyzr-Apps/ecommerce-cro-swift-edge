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
import {
  LayoutDashboard,
  Plug,
  MessageSquare,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Send,
  Loader2,
  Check,
  AlertCircle,
  ChevronRight,
  X,
  User,
  Menu
} from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'

// Agent ID from workflow
const AGENT_ID = "69797ab1a5d355f8aa48876f"

// TypeScript interfaces from REAL test data
interface Analysis {
  data_summary: string
  key_findings: string[]
}

interface Recommendation {
  category: 'pricing' | 'operations' | 'inventory' | 'marketing' | 'gmc'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  expected_impact: string
}

interface ActionItem {
  task: string
  timeline: 'immediate' | 'short-term' | 'long-term'
}

interface Metrics {
  current_conversion_rate: string
  potential_improvement: string
}

interface AgentResult {
  analysis: Analysis
  recommendations: Recommendation[]
  action_items: ActionItem[]
  metrics: Metrics
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

type View = 'dashboard' | 'integrations' | 'chat' | 'gmc-setup'

// Dashboard metrics component
function MetricCard({ title, value, change, icon: Icon }: {
  title: string
  value: string
  change?: number
  icon: any
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {change !== undefined && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Quick insight card component
function QuickInsightCard({ recommendation }: { recommendation: Recommendation }) {
  const categoryColors = {
    pricing: 'bg-blue-100 text-blue-800 border-blue-300',
    operations: 'bg-purple-100 text-purple-800 border-purple-300',
    inventory: 'bg-orange-100 text-orange-800 border-orange-300',
    marketing: 'bg-pink-100 text-pink-800 border-pink-300',
    gmc: 'bg-teal-100 text-teal-800 border-teal-300'
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  return (
    <div className={`p-4 rounded-lg border ${categoryColors[recommendation.category]}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge className={priorityColors[recommendation.priority]}>
          {recommendation.priority.toUpperCase()}
        </Badge>
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
                {/* Analysis */}
                {message.agentResponse.analysis && (
                  <div className="bg-white rounded p-3 text-slate-900">
                    <h4 className="font-semibold text-sm mb-2">Analysis</h4>
                    <p className="text-xs mb-2">{message.agentResponse.analysis.data_summary}</p>
                    {message.agentResponse.analysis.key_findings.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Key Findings:</p>
                        <ul className="text-xs space-y-1 pl-4">
                          {message.agentResponse.analysis.key_findings.map((finding, i) => (
                            <li key={i} className="list-disc">{finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                {message.agentResponse.recommendations && message.agentResponse.recommendations.length > 0 && (
                  <div className="bg-white rounded p-3 text-slate-900">
                    <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {message.agentResponse.recommendations.map((rec, i) => (
                        <div key={i} className="border rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={rec.priority === 'high' ? 'bg-red-100 text-red-800' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                              {rec.priority}
                            </Badge>
                            <span className="text-xs font-medium text-slate-500">{rec.category}</span>
                          </div>
                          <h5 className="font-semibold text-xs mb-1">{rec.title}</h5>
                          <p className="text-xs text-slate-600 mb-1">{rec.description}</p>
                          <p className="text-xs text-teal-600 font-medium">{rec.expected_impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {message.agentResponse.action_items && message.agentResponse.action_items.length > 0 && (
                  <div className="bg-white rounded p-3 text-slate-900">
                    <h4 className="font-semibold text-sm mb-2">Action Items</h4>
                    <div className="space-y-2">
                      {message.agentResponse.action_items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-teal-500" />
                          <div className="flex-1">
                            <p className="font-medium">{item.task}</p>
                            <p className="text-slate-500">Timeline: {item.timeline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metrics */}
                {message.agentResponse.metrics && (
                  <div className="bg-white rounded p-3 text-slate-900">
                    <h4 className="font-semibold text-sm mb-2">Metrics</h4>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium">Current Rate:</span> {message.agentResponse.metrics.current_conversion_rate}</p>
                      <p><span className="font-medium">Potential:</span> {message.agentResponse.metrics.potential_improvement}</p>
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

// GMC Setup Wizard
function GmcSetupWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const totalSteps = 4

  const [formData, setFormData] = useState({
    businessName: '',
    websiteUrl: '',
    shipping: '',
    categories: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const progress = (step / totalSteps) * 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle>Google Merchant Center Setup</CardTitle>
            <CardDescription>Step {step} of {totalSteps}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progress} className="w-full" />

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900">Business Information</h3>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-xs text-teal-800">
                  <strong>AI Tip:</strong> Ensure your website URL matches exactly with your domain verification.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900">Product Feed Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="categories">Product Categories</Label>
                <Textarea
                  id="categories"
                  value={formData.categories}
                  onChange={(e) => handleInputChange('categories', e.target.value)}
                  placeholder="Electronics, Clothing, Home & Garden..."
                  rows={4}
                />
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-xs text-teal-800">
                  <strong>AI Tip:</strong> Use Google's product taxonomy for better categorization and visibility.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900">Shipping & Policies</h3>
              <div className="space-y-2">
                <Label htmlFor="shipping">Shipping Zones</Label>
                <Textarea
                  id="shipping"
                  value={formData.shipping}
                  onChange={(e) => handleInputChange('shipping', e.target.value)}
                  placeholder="US: $5.99 standard, Free over $50..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-500" />
                  <span className="text-sm text-slate-700">Return policy configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-500" />
                  <span className="text-sm text-slate-700">Privacy policy published</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900">Verification & Launch</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-medium text-sm text-slate-900">Domain Verified</p>
                    <p className="text-xs text-slate-500">www.yourstore.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-medium text-sm text-slate-900">Product Feed Ready</p>
                    <p className="text-xs text-slate-500">1,247 products validated</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                  <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                  <div>
                    <p className="font-medium text-sm text-slate-900">Final Review</p>
                    <p className="text-xs text-slate-500">Estimated completion: 2-3 hours</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(Math.min(totalSteps, step + 1))}
                className="bg-teal-500 hover:bg-teal-600"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={onClose}
                className="bg-teal-500 hover:bg-teal-600"
              >
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [chatOpen, setChatOpen] = useState(false)
  const [showGmcWizard, setShowGmcWizard] = useState(false)
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
          content: 'Here are my recommendations based on your query:',
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
    "Analyze my top-performing products",
    "How can I optimize my GMC feed?",
    "What pricing strategies should I test?",
    "Review my checkout process"
  ]

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-teal-400">CRO AI Assistant</h1>
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
            onClick={() => { setCurrentView('integrations'); setChatOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'integrations' ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Plug className="h-5 w-5" />
            <span>Integrations</span>
          </button>
          <button
            onClick={() => setShowGmcWizard(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>GMC Setup</span>
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
                {currentView === 'dashboard' ? 'Dashboard' : currentView === 'integrations' ? 'Integrations' : 'Chat'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <div className={`h-2 w-2 rounded-full ${posConnection.status === 'connected' && gmcConnection.status === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                <span className="text-sm text-slate-600">
                  {posConnection.status === 'connected' && gmcConnection.status === 'connected' ? 'All Systems Connected' : 'Partial Connection'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Revenue"
                  value="$124,500"
                  change={12.5}
                  icon={DollarSign}
                />
                <MetricCard
                  title="Conversion Rate"
                  value="2.4%"
                  change={-3.2}
                  icon={TrendingUp}
                />
                <MetricCard
                  title="Avg Order Value"
                  value="$89.50"
                  change={5.8}
                  icon={ShoppingCart}
                />
                <MetricCard
                  title="Active Users"
                  value="8,432"
                  change={18.3}
                  icon={Users}
                />
              </div>

              {/* Sales Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <p className="text-slate-500">Sales chart visualization</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Insights */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>AI Recommendations</CardTitle>
                    <CardDescription>Top 3 optimization opportunities</CardDescription>
                  </div>
                  <Button
                    onClick={() => setChatOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask CRO AI
                  </Button>
                </CardHeader>
                <CardContent>
                  {lastAgentResponse && lastAgentResponse.recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {lastAgentResponse.recommendations.slice(0, 3).map((rec, i) => (
                        <QuickInsightCard key={i} recommendation={rec} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500 mb-4">No recommendations yet</p>
                      <Button
                        onClick={() => {
                          setChatOpen(true)
                          setTimeout(() => {
                            handleSendMessage("What are your top recommendations to improve my e-commerce conversion rate?")
                          }, 500)
                        }}
                        variant="outline"
                        className="border-teal-500 text-teal-600 hover:bg-teal-50"
                      >
                        Get AI Recommendations
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PoS Connection */}
              <Card>
                <CardHeader>
                  <CardTitle>Point of Sale Integration</CardTitle>
                  <CardDescription>Connect your PoS system for real-time data</CardDescription>
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
                        className="w-full bg-teal-500 hover:bg-teal-600"
                        disabled={!posEndpoint.trim()}
                      >
                        Connect PoS
                      </Button>
                    </div>
                  )}

                  {posConnection.status === 'connecting' && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
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

              {/* GMC Connection */}
              <Card>
                <CardHeader>
                  <CardTitle>Google Merchant Center</CardTitle>
                  <CardDescription>Sync your product feed with GMC</CardDescription>
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
                      <Button
                        onClick={() => setShowGmcWizard(true)}
                        variant="outline"
                        className="w-full"
                      >
                        Launch Setup Wizard
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
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowGmcWizard(true)}
                        >
                          Configure
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setGmcConnection({ status: 'disconnected' })}
                        >
                          Disconnect
                        </Button>
                      </div>
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
              <h3 className="font-semibold">CRO AI Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className={`h-2 w-2 rounded-full ${posConnection.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>PoS</span>
              <div className={`h-2 w-2 rounded-full ${gmcConnection.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>GMC</span>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">Ask me anything about optimizing your e-commerce store:</p>
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

      {/* GMC Setup Wizard Modal */}
      {showGmcWizard && <GmcSetupWizard onClose={() => setShowGmcWizard(false)} />}
    </div>
  )
}
