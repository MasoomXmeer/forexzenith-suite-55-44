
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext.minimal';
import { useSupportTickets, CreateTicketData } from '@/hooks/useSupportTickets';
import { MessageCircle, Phone, Mail, Clock, Ticket, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Support = () => {
  const { user } = useAuth();
  const { tickets, isLoading, createTicket, addMessage } = useSupportTickets();
  const [ticketForm, setTicketForm] = useState<CreateTicketData>({
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.message) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const ticket = await createTicket(ticketForm);
      if (ticket) {
        setTicketForm({
          subject: '',
          category: '',
          priority: 'medium',
          message: ''
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (ticketId: string) => {
    if (!replyMessage.trim()) return;

    const success = await addMessage(ticketId, replyMessage);
    if (success) {
      setReplyMessage('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'waiting_response': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const faqs = [
    {
      question: "How do I deposit funds into my account?",
      answer: "You can deposit funds through the Funding page using credit/debit cards, bank transfers, or other supported payment methods. Minimum deposit is $50."
    },
    {
      question: "What is the minimum trade size?",
      answer: "The minimum trade size is 0.01 lots (micro lots) across all currency pairs and instruments."
    },
    {
      question: "How long does withdrawal take?",
      answer: "Withdrawal processing times vary by method: Credit cards (1-3 business days), Bank transfers (3-5 business days), E-wallets (instant to 24 hours)."
    },
    {
      question: "What leverage is available?",
      answer: "We offer leverage ranging from 1:30 to 1:1000, depending on your account type and the instrument being traded."
    },
    {
      question: "Is my money safe with AonePrimeFX?",
      answer: "Yes, we segregate client funds in tier-1 banks and maintain comprehensive insurance coverage. We're also regulated by major financial authorities."
    },
    {
      question: "Can I trade on mobile?",
      answer: "Yes, our platform is fully responsive and optimized for mobile trading. You can also download our dedicated mobile app."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Support Center</h1>
        <p className="text-muted-foreground">Get help with your trading account and platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>Get instant help from our support team</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">Start Live Chat</Button>
            <p className="text-sm text-muted-foreground mt-2">Available 24/5</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle>Phone Support</CardTitle>
            <CardDescription>Speak directly with our experts</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-medium">+1 (555) 123-4567</p>
            <p className="text-sm text-muted-foreground mt-2">Mon-Fri 8AM-8PM EST</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle>Email Support</CardTitle>
            <CardDescription>Send us detailed questions</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-medium">support@aoneprimefx.com</p>
            <p className="text-sm text-muted-foreground mt-2">Response within 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="ticket">Submit Ticket</TabsTrigger>
          <TabsTrigger value="status">My Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ticket" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Support Ticket</CardTitle>
              <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTicketSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({...ticketForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="trading">Trading Issues</SelectItem>
                        <SelectItem value="account">Account Management</SelectItem>
                        <SelectItem value="deposits">Deposits & Withdrawals</SelectItem>
                        <SelectItem value="platform">Platform Technical Issues</SelectItem>
                        <SelectItem value="verification">Account Verification</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={ticketForm.priority} onValueChange={(value: any) => setTicketForm({...ticketForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                    placeholder="Provide detailed information about your issue..."
                    rows={6}
                    required
                    className="resize-none"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                My Support Tickets
              </CardTitle>
              <CardDescription>Track your support requests and replies</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                  <p className="text-muted-foreground">Loading your tickets...</p>
                </div>
              ) : !user ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Please sign in to view your tickets</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No support tickets found</p>
                  <p className="text-sm text-muted-foreground mt-2">Submit a ticket above to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">#{ticket.ticket_number}</span>
                            <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                            <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base">{ticket.subject}</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {ticket.messages && ticket.messages.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MessageSquare className="h-4 w-4" />
                                <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
                              </div>
                              
                              <div className="max-h-40 overflow-y-auto space-y-3 border-l-2 border-muted pl-4">
                                {ticket.messages.map((message, index) => (
                                  <div key={message.id} className={`text-sm p-3 rounded-lg ${
                                    message.is_staff 
                                      ? 'bg-blue-50 border-blue-200 border' 
                                      : 'bg-muted'
                                  }`}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-xs">
                                        {message.is_staff ? 'Support Team' : 'You'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                      </span>
                                    </div>
                                    <p className="text-foreground leading-relaxed">{message.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <Label htmlFor={`reply-${ticket.id}`} className="text-sm font-medium">Add Reply</Label>
                                <Textarea
                                  id={`reply-${ticket.id}`}
                                  value={selectedTicket === ticket.id ? replyMessage : ''}
                                  onChange={(e) => {
                                    setSelectedTicket(ticket.id);
                                    setReplyMessage(e.target.value);
                                  }}
                                  placeholder="Type your reply..."
                                  rows={3}
                                  className="resize-none"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleReplySubmit(ticket.id)}
                                  disabled={!replyMessage.trim()}
                                >
                                  Send Reply
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
