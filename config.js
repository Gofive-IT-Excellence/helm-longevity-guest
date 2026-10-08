// Public configuration only. Never place a HELM API key in this file.
// The published n8n workflow accepts requests from the company domain.
window.HELM_CONFIG={
  webhookBaseUrl:"https://n8n.tks.co.th/webhook/helm-longevity-guest",
  aiEnabled:window.location.hostname==="helmlongevity.go5.online"
};
