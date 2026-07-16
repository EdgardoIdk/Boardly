import { View } from 'react-native';

function SkeletonCard() {
  return (
    <View className="rounded-2xl bg-surface-card border border-bd/15 p-5 mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <View className="w-24 h-4 bg-bd/20 rounded-md" />
        <View className="w-6 h-6 bg-bd/20 rounded-full" />
      </View>
      <View className="w-16 h-10 bg-bd/20 rounded-lg mb-2" />
      <View className="w-32 h-4 bg-bd/20 rounded-md" />
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View className="px-5 mt-2">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}
