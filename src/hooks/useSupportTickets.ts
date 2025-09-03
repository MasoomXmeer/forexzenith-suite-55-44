import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext.minimal';
import { toast } from '@/hooks/use-toast';

export interface SupportTicket {
  id: string;
  user_id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_staff: boolean;
  attachments?: any[];
  created_at: string;
}

export interface CreateTicketData {
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
}

export const useSupportTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          messages:support_messages(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async (ticketData: CreateTicketData): Promise<SupportTicket | null> => {
    if (!user) return null;

    try {
      // Create the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user.id,
          subject: ticketData.subject,
          category: ticketData.category,
          priority: ticketData.priority,
          status: 'open'
        }])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Create the initial message
      const { error: messageError } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: ticket.id,
          user_id: user.id,
          message: ticketData.message,
          is_staff: false
        }]);

      if (messageError) throw messageError;

      toast({
        title: "Support Ticket Created",
        description: `Your ticket ${ticket.ticket_number} has been submitted. We'll respond within 24 hours.`,
      });

      await loadTickets();
      return ticket;
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact us directly",
        variant: "destructive"
      });
      return null;
    }
  };

  const addMessage = async (ticketId: string, message: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_staff: false
        }]);

      if (error) throw error;

      // Update ticket status to waiting_response if it was resolved
      await supabase
        .from('support_tickets')
        .update({ 
          status: 'waiting_response',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .eq('status', 'resolved');

      await loadTickets();
      return true;
    } catch (error: any) {
      console.error('Error adding message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTicketByNumber = (ticketNumber: string): SupportTicket | undefined => {
    return tickets.find(ticket => ticket.ticket_number === ticketNumber);
  };

  return {
    tickets,
    isLoading,
    loadTickets,
    createTicket,
    addMessage,
    getTicketByNumber
  };
};

// Admin hook for managing all tickets
export const useAdminSupportTickets = () => {
  const { user, profile } = useAuth();
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = profile?.user_role === 'admin' || profile?.user_role === 'super_admin';

  useEffect(() => {
    if (user && isAdmin) {
      loadAllTickets();
    }
  }, [user, isAdmin]);

  const loadAllTickets = async () => {
    if (!user || !isAdmin) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          messages:support_messages(*),
          user:profiles!support_tickets_user_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllTickets(data || []);
    } catch (error: any) {
      console.error('Error loading all tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']): Promise<boolean> => {
    if (!user || !isAdmin) return false;

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      await loadAllTickets();
      toast({
        title: "Success",
        description: `Ticket status updated to ${status}`,
      });
      return true;
    } catch (error: any) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
      return false;
    }
  };

  const assignTicket = async (ticketId: string, staffId: string): Promise<boolean> => {
    if (!user || !isAdmin) return false;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          assigned_to: staffId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      await loadAllTickets();
      toast({
        title: "Success",
        description: "Ticket assigned successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive"
      });
      return false;
    }
  };

  const addAdminReply = async (ticketId: string, message: string): Promise<boolean> => {
    if (!user || !isAdmin) return false;

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_staff: true
        }]);

      if (error) throw error;

      // Update ticket status
      await supabase
        .from('support_tickets')
        .update({ 
          status: 'waiting_response',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      await loadAllTickets();
      return true;
    } catch (error: any) {
      console.error('Error adding admin reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    allTickets,
    isLoading,
    isAdmin,
    loadAllTickets,
    updateTicketStatus,
    assignTicket,
    addAdminReply
  };
};