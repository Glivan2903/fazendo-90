
// Update the NewPlanDialog usage to match its props
<NewPlanDialog 
  open={editPlanDialogOpen} 
  onOpenChange={setEditPlanDialogOpen}
  plan={editingPlan}  // Add this prop
  onSuccess={handleRefresh}
/>
