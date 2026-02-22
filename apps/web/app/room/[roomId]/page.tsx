import { RoomLayout } from "../../../components/RoomLayout";

interface RoomPageProps {
  params: { id: string };
}

export default function RoomPage({ params }: RoomPageProps) {
  return <RoomLayout roomId={params.id} />;
}