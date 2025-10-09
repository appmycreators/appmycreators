import { useState, useEffect } from 'react';
import { FormService } from '@/services/supabaseService';
import { usePage } from './usePage';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  form_name: string;
  description?: string;
  fields_config?: {
    name: boolean;
    email: boolean;
    phone: boolean;
  };
  submit_button_text?: string;
  submit_button_color?: string;
  success_message?: string;
  success_button_text?: string;
  success_button_color?: string;
  success_bg_color?: string;
}

interface Form {
  id: string;
  title: string;
  form_data: FormData;
}

export const useFormSync = () => {
  const { user } = useAuth();
  const { refreshPage } = usePage();
  const [loading, setLoading] = useState(false);

  const addForm = async (title: string, formData: FormData): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const success = await FormService.createFormResource(user.id, title, formData);
      if (success) {
        await refreshPage();
      }
      return success;
    } catch (error) {
      console.error('Error adding form:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateForm = async (resourceId: string, formData: Partial<FormData>): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await FormService.updateForm(resourceId, formData);
      if (success) {
        await refreshPage();
      }
      return success;
    } catch (error) {
      console.error('Error updating form:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateResourceTitle = async (resourceId: string, title: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await FormService.updateResourceTitle(resourceId, title);
      if (success) {
        await refreshPage();
      }
      return success;
    } catch (error) {
      console.error('Error updating resource title:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (resourceId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await FormService.deleteForm(resourceId);
      if (success) {
        await refreshPage();
      }
      return success;
    } catch (error) {
      console.error('Error deleting form:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addForm,
    updateForm,
    updateResourceTitle,
    deleteForm,
    loading,
  };
};
