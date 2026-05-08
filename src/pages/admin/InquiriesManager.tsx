import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Eye, Trash2, Search, Mail, Phone, MapPin, Calendar, Users, DollarSign, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  event_type: string;
  event_date: string;
  location: string;
  audience_size: string | null;
  budget: string | null;
  details: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const eventTypeLabels: Record<string, string> = {
  corporate: "Corporate Event",
  private: "Private Party",
  wedding: "Wedding",
  other: "Other",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  contacted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  negotiating: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  declined: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from("private_show_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to load inquiries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("private_show_inquiries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      setInquiries(prev => 
        prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq)
      );
      
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("private_show_inquiries")
        .update({ notes })
        .eq("id", selectedInquiry.id);

      if (error) throw error;
      
      setInquiries(prev => 
        prev.map(inq => inq.id === selectedInquiry.id ? { ...inq, notes } : inq)
      );
      setSelectedInquiry(prev => prev ? { ...prev, notes } : null);
      
      toast.success("Notes saved");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    
    try {
      const { error } = await supabase
        .from("private_show_inquiries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setInquiries(prev => prev.filter(inq => inq.id !== id));
      toast.success("Inquiry deleted");
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      toast.error("Failed to delete inquiry");
    }
  };

  const openViewDialog = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNotes(inquiry.notes || "");
    setIsViewDialogOpen(true);
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Private Show Inquiries</h1>
        <p className="text-muted-foreground">Manage and respond to private show booking requests</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["pending", "contacted", "negotiating", "confirmed", "declined"].map(status => (
          <Card key={status}>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">
                {inquiries.filter(i => i.status === status).length}
              </div>
              <div className="text-sm text-muted-foreground capitalize">{status}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Inquiries ({filteredInquiries.length})</CardTitle>
          <CardDescription>Click on an inquiry to view details and add notes</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No inquiries found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => openViewDialog(inquiry)}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>{eventTypeLabels[inquiry.event_type] || inquiry.event_type}</TableCell>
                      <TableCell>{inquiry.event_date}</TableCell>
                      <TableCell>{inquiry.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[inquiry.status] || ""}>
                          {inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" onClick={() => openViewDialog(inquiry)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(inquiry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedInquiry && format(new Date(selectedInquiry.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Status:</span>
                <Select value={selectedInquiry.status} onValueChange={(value) => handleStatusChange(selectedInquiry.id, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Info */}
              <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Contact Information</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedInquiry.name}</span>
                  </div>
                  <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="h-4 w-4" />
                    {selectedInquiry.email}
                  </a>
                  {selectedInquiry.phone && (
                    <a href={`tel:${selectedInquiry.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="h-4 w-4" />
                      {selectedInquiry.phone}
                    </a>
                  )}
                  {selectedInquiry.company && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {selectedInquiry.company}
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Event Details</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Date:</strong> {selectedInquiry.event_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Location:</strong> {selectedInquiry.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span><strong>Type:</strong> {eventTypeLabels[selectedInquiry.event_type] || selectedInquiry.event_type}</span>
                  </div>
                  {selectedInquiry.audience_size && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Audience:</strong> {selectedInquiry.audience_size}</span>
                    </div>
                  )}
                  {selectedInquiry.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Budget:</strong> {selectedInquiry.budget}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              {selectedInquiry.details && (
                <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Additional Details</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedInquiry.details}</p>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label className="font-semibold">Internal Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this inquiry..."
                  rows={4}
                />
                <Button onClick={handleSaveNotes} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Notes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}