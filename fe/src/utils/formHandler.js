export const handleChange = (setFormData) => (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  export const handleFileChange = (setFormData) => (e) => {
    setFormData((prev) => ({ ...prev, prescriptionFile: e.target.files[0] }));
  };
  
  export const handleRequestItemChange = (setFormData) => (index, e) => {
    const { name, value } = e.target;
    const newRequestItems = [...formData.requestItems];
    newRequestItems[index][name] = value;
    setFormData((prev) => ({ ...prev, requestItems: newRequestItems }));
  };
  
  export const handleIntakeTimeChange = (setFormData) => (index, e) => {
    const times = e.target.value.split(",").map((t) => t.trim());
    const newRequestItems = [...formData.requestItems];
    newRequestItems[index].intakeTemplateTime = times;
    setFormData((prev) => ({ ...prev, requestItems: newRequestItems }));
  };
  
  export const handleAddRequestItem = (setFormData) => () => {
    setFormData((prev) => ({
      ...prev,
      requestItems: [...prev.requestItems, { name: "", intakeTemplateTime: [], dosageUsage: "" }],
    }));
  };
  
  export const handleRemoveRequestItem = (setFormData) => (index) => {
    setFormData((prev) => ({
      ...prev,
      requestItems: prev.requestItems.filter((_, i) => i !== index),
    }));
  };