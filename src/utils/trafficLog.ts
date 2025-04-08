export function logAction(action: string) {
    const formData = new FormData();
    formData.append('entry.1341205461', action);
    formData.append('entry.1869831758', new Date().toISOString());
  
    fetch('https://docs.google.com/forms/d/e/1FAIpQLSfz3UP2qa_JALCoz8BBIyaTgk3l3dVNd7N9XuaVZJG4gpEvFA/formResponse', {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });
}
  