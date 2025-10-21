import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FormService, FormLeadService, type FormWithStats, type FormLead } from '@/services/supabaseService';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/ui/topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Trash2, Loader2, Search, Calendar, Mail, Phone, User } from 'lucide-react';

const Leads = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [leads, setLeads] = useState<FormLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalLeads, setTotalLeads] = useState(0);

  // Load forms on mount
  useEffect(() => {
    if (user) {
      loadForms();
    }
  }, [user]);

  // Load leads when form is selected
  useEffect(() => {
    if (selectedFormId) {
      loadLeads(selectedFormId);
    }
  }, [selectedFormId]);

  const loadForms = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await FormService.getUserFormsWithStats(user.id);
      setForms(data);

      // Auto-select first form if available
      if (data.length > 0 && !selectedFormId) {
        setSelectedFormId(data[0].form_id);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async (formId: string) => {
    setLeadsLoading(true);
    try {
      const { leads: data, total } = await FormLeadService.getFormLeadsWithStats(formId);
      setLeads(data);
      setTotalLeads(total);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    const success = await FormLeadService.deleteLead(leadId);
    if (success && selectedFormId) {
      loadLeads(selectedFormId);
      loadForms(); // Refresh stats
    }
  };

  const handleExportCSV = () => {
    const selectedForm = forms.find((f) => f.form_id === selectedFormId);
    if (selectedForm && leads.length > 0) {
      FormLeadService.exportLeadsToCSV(leads, selectedForm.form_name);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (lead.name?.toLowerCase().includes(searchLower) ?? false) ||
      (lead.email?.toLowerCase().includes(searchLower) ?? false) ||
      (lead.phone?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const selectedForm = forms.find((f) => f.form_id === selectedFormId);

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <FileText className="w-8 h-8" />
                  Gerenciar Leads
                </h1>
                <p className="text-muted-foreground mt-1">
                  Visualize e gerencie os leads capturados pelos seus formulários
                </p>
              </div>
            </div>

            {/* No Forms State */}
            {forms.length === 0 && (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Nenhum formulário criado</h2>
                <p className="text-muted-foreground mb-4">
                  Crie um formulário na página principal para começar a capturar leads
                </p>
              </Card>
            )}

            {/* Forms and Leads */}
            {forms.length > 0 && (
              <>
                {/* Form Selector and Stats */}
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">
                        Selecione um Formulário
                      </label>
                      <Select value={selectedFormId || ''} onValueChange={setSelectedFormId}>
                        <SelectTrigger className="w-full sm:w-80">
                          <SelectValue placeholder="Escolha um formulário" />
                        </SelectTrigger>
                        <SelectContent>
                          {forms.map((form) => (
                            <SelectItem key={form.form_id} value={form.form_id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{form.form_name}</span>
                                <span className="ml-4 text-xs text-muted-foreground">
                                  {form.lead_count} leads
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedForm && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {selectedForm.lead_count}
                          </div>
                          <div className="text-xs text-muted-foreground">Total de Leads</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium">
                            {selectedForm.last_lead_at
                              ? new Date(selectedForm.last_lead_at).toLocaleDateString('pt-BR')
                              : 'Nenhum'}
                          </div>
                          <div className="text-xs text-muted-foreground">Último Lead</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Leads Table */}
                {selectedFormId && (
                  <Card className="p-6">
                    <div className="space-y-4">
                      {/* Search and Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Button
                          onClick={handleExportCSV}
                          disabled={leads.length === 0}
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar CSV
                        </Button>
                      </div>

                      {/* Table */}
                      {leadsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : filteredLeads.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {searchTerm
                              ? 'Nenhum lead encontrado com esse critério'
                              : 'Nenhum lead capturado ainda'}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Nome
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Telefone
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Data
                                  </div>
                                </TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredLeads.map((lead) => (
                                <TableRow key={lead.id}>
                                  <TableCell className="font-medium">
                                    {lead.name || '-'}
                                  </TableCell>
                                  <TableCell>{lead.email || '-'}</TableCell>
                                  <TableCell>{lead.phone || '-'}</TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(lead.created_at).toLocaleTimeString('pt-BR')}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteLead(lead.id)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Results Count */}
                      {filteredLeads.length > 0 && (
                        <div className="text-sm text-muted-foreground text-center">
                          Mostrando {filteredLeads.length} de {totalLeads} leads
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;
