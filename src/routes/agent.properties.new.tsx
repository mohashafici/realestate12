import { createFileRoute } from "@tanstack/react-router";
import { NewOrEditWrapper, PropertyForm, useAddProperty } from "@/components/property-form";

export const Route = createFileRoute("/agent/properties/new")({
  component: NewProperty,
});

function NewProperty() {
  const onSubmit = useAddProperty();
  return (
    <NewOrEditWrapper title="Add property">
      <PropertyForm onSubmit={onSubmit} submitLabel="Save property" />
    </NewOrEditWrapper>
  );
}
