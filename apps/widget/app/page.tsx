import { WidgetView } from "@/modules/widget/ui/views/widget-view";

interface Props {
  searchParams: Promise<{
    organizationId?: string;
  }>;
}

const Page = async ({ searchParams }: Props) => {
  const params = await searchParams;

  return (
    <WidgetView
      organizationId={params.organizationId || ""}
    />
  );
};

export default Page;