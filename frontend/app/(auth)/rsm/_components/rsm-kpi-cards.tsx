import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconUsers,
  IconHeart,
  IconFileText,
  IconCalendarClock,
} from "@tabler/icons-react";
import type { RsmKPIs } from "@/services/rsm";

interface RsmKpiCardsProps {
  kpis: RsmKPIs;
}

export function RsmKpiCards({ kpis }: RsmKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contas Ativas</CardTitle>
          <IconUsers className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.totalAccounts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Seguidores</CardTitle>
          <IconHeart className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis.totalFollowers.toLocaleString("pt-BR")}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Posts este Mes</CardTitle>
          <IconFileText className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.postsThisMonth}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendados</CardTitle>
          <IconCalendarClock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.scheduledPosts}</div>
        </CardContent>
      </Card>
    </div>
  );
}
