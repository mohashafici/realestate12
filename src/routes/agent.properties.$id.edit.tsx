import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { NewOrEditWrapper, PropertyForm } from "@/components/property-form";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/agent/properties/$id/edit")({
  component: EditProperty,
});

function EditProperty() {
  const { id } = useParams({ from: "/agent/properties/$id/edit" });
  const navigate = useNavigate();
  const property = useApp((s) => s.properties.find((p) => p.id === id));
  const update = useApp((s) => s.updateProperty);

  if (!property) {
    return (
      <NewOrEditWrapper title="Property not found">
        <p className="text-sm text-muted-foreground">This property no longer exists.</p>
      </NewOrEditWrapper>
    );
  }

  return (
    <NewOrEditWrapper title="Edit property">
      <PropertyForm
        initial={property}
        onSubmit={(data) => { update(id, data); toast.success("Changes saved"); navigate({ to: "/agent/properties" }); }}
        submitLabel="Save changes"
      />
    </NewOrEditWrapper>
  );
}
