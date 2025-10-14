import { usePage } from "@/hooks/usePage";
import { FormResource } from "../FormResource";

/**
 * FormBlock - Componente específico para renderizar formulários
 * Responsabilidade única: Renderizar e gerenciar um formulário específico
 */

interface FormBlockProps {
  formId: string;
  cardBgColor?: string;
  cardTextColor?: string;
  onEditForm: (formResource: any) => void;
  onDeleteForm: (formId: string) => void;
}

const FormBlock = ({ formId, cardBgColor, cardTextColor, onEditForm, onDeleteForm }: FormBlockProps) => {
  const { pageData } = usePage();
  
  const formResource = pageData.resources?.find((r) => r.id === formId && r.type === "form");
  
  if (!formResource || !formResource.form_data) return null;

  return (
    <FormResource
      formId={formResource.form_data.id}
      formData={formResource.form_data}
      title={formResource.title}
      cardBgColor={cardBgColor}
      cardTextColor={cardTextColor}
      onEdit={() => onEditForm(formResource)}
      onDelete={() => onDeleteForm(formResource.id)}
    />
  );
};

export default FormBlock;
