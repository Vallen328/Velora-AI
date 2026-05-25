import { WidgetView } from "@/modules/widget/ui/views/widget-view";

interface Props {
  searchParams: {
    organizationId?: string;
  };
}

const Page = ({ searchParams }: Props) => {
  return (
    <WidgetView
      organizationId={searchParams.organizationId || ""}
    />
  );
};

export default Page;