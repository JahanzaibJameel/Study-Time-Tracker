import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useShimmerAnimation } from '@/lib/animations';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  variant?: 'circular' | 'rectangular' | 'text' | 'avatar' | 'button';
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = '100%',
  height,
  borderRadius: customBorderRadius,
  variant = 'rectangular',
  style,
}: SkeletonProps) {
  const { theme } = useTheme();
  const { start, animatedStyle } = useShimmerAnimation();

  React.useEffect(() => {
    start();
  }, [start]);

  const getBorderRadius = () => {
    if (customBorderRadius !== undefined) return customBorderRadius;
    switch (variant) {
      case 'circular':
        return 9999;
      case 'avatar':
        return BorderRadius.full;
      case 'button':
        return BorderRadius.full;
      case 'text':
        return BorderRadius.xs;
      default:
        return BorderRadius.sm;
    }
  };

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius: getBorderRadius(),
          backgroundColor: theme.backgroundSecondary,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}

interface SkeletonCardProps {
  variant?: 'default' | 'subject' | 'session' | 'stat' | 'profile';
  style?: StyleProp<ViewStyle>;
}

export function SkeletonCard({ variant = 'default', style }: SkeletonCardProps) {
  const { theme } = useTheme();
  const { start, animatedStyle } = useShimmerAnimation();

  React.useEffect(() => {
    start();
  }, [start]);

  const renderDefault = () => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }, animatedStyle, style]}>
      <Skeleton width="60%" height={24} variant="text" style={styles.cardTitle} />
      <Skeleton width="80%" height={16} variant="text" style={styles.cardSubtitle} />
      <Skeleton width="40%" height={16} variant="text" style={[styles.cardSubtitle, { marginTop: Spacing.xs }]} />
    </View>
  );

  const renderSubject = () => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }, animatedStyle, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
        <Skeleton width="50%" height={28} variant="text" />
        <Skeleton width={60} height={60} variant="circular" />
      </View>
      <Skeleton width="100%" height={8} variant="rectangular" style={styles.progressBar} />
      <View style={styles.buttonRow}>
        <Skeleton width="100%" height={48} variant="button" style={styles.button} />
        <Skeleton width="100%" height={48} variant="button" style={styles.button} />
      </View>
    </View>
  );

  const renderSession = () => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }, animatedStyle, style]}>
      <View style={styles.sessionRow}>
        <Skeleton width={36} height={36} variant="avatar" style={styles.icon} />
        <View style={styles.sessionContent}>
          <Skeleton width="60%" height={20} variant="text" />
          <Skeleton width="40%" height={14} variant="text" style={{ marginTop: Spacing.xs }} />
          <Skeleton width="30%" height={12} variant="text" style={{ marginTop: Spacing.xs }} />
        </View>
        <Skeleton width={50} height={20} variant="text" />
      </View>
    </View>
  );

  const renderStat = () => (
    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }, animatedStyle, style]}>
      <Skeleton width={40} height={40} variant="circular" style={styles.icon} />
      <Skeleton width="50%" height={28} variant="text" style={styles.statValue} />
      <Skeleton width="70%" height={14} variant="text" style={styles.statLabel} />
    </View>
  );

  const renderProfile = () => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }, animatedStyle, style]}>
      <View style={styles.profileRow}>
        <Skeleton width={60} height={60} variant="avatar" />
        <View style={styles.profileContent}>
          <Skeleton width="50%" height={24} variant="text" style={styles.cardTitle} />
          <Skeleton width="80%" height={16} variant="text" style={styles.cardSubtitle} />
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'subject':
        return renderSubject();
      case 'session':
        return renderSession();
      case 'stat':
        return renderStat();
      case 'profile':
        return renderProfile();
      default:
        return renderDefault();
    }
  };

  return <>{renderContent()}</>;
}

interface SkeletonListProps {
  count?: number;
  itemVariant?: 'default' | 'subject' | 'session' | 'stat' | 'profile';
  spacing?: number;
}

export function SkeletonList({
  count = 5,
  itemVariant = 'default',
  spacing = Spacing.lg,
}: SkeletonListProps) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={itemVariant} />
      ))}
    </View>
  );
}

interface SkeletonScreenProps {
  variant?: 'home' | 'subjects' | 'timer' | 'stats' | 'settings';
}

export function SkeletonScreen({ variant = 'home' }: SkeletonScreenProps) {
  const renderHome = () => (
    <View style={styles.screen}>
      <SkeletonCard variant="profile" style={styles.profileCard} />
      <SkeletonCard variant="stat" style={styles.statCard} />
      <SkeletonCard variant="default" style={styles.sectionHeader} />
      <SkeletonList count={4} itemVariant="session" />
    </View>
  );

  const renderSubjects = () => (
    <View style={styles.screen}>
      <SkeletonList count={6} itemVariant="subject" />
    </View>
  );

  const renderTimer = () => (
    <View style={styles.screen}>
      <SkeletonCard variant="default" style={styles.timerHeader} />
      <Skeleton width={240} height={240} variant="circular" style={styles.timerCircle} />
      <View style={styles.buttonRow}>
        <Skeleton width="100%" height={80} variant="button" />
        <Skeleton width="100%" height={56} variant="button" style={{ marginTop: Spacing.md }} />
        <Skeleton width="100%" height={56} variant="button" style={{ marginTop: Spacing.md }} />
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.screen}>
      <SkeletonCard variant="default" style={styles.chartCard} />
      <View style={styles.statRow}>
        <SkeletonCard variant="stat" style={styles.statCard} />
        <SkeletonCard variant="stat" style={styles.statCard} />
        <SkeletonCard variant="stat" style={styles.statCard} />
      </View>
      <SkeletonCard variant="default" style={styles.sectionHeader} />
      <SkeletonList count={5} itemVariant="stat" />
    </View>
  );

  const renderSettings = () => (
    <View style={styles.screen}>
      <SkeletonCard variant="profile" style={styles.profileCard} />
      <SkeletonCard variant="default" style={styles.sectionHeader} />
      <SkeletonCard variant="default" />
      <SkeletonCard variant="default" />
      <SkeletonCard variant="default" />
      <SkeletonCard variant="default" style={styles.sectionHeader} />
      <SkeletonCard variant="default" />
      <SkeletonCard variant="default" />
      <SkeletonCard variant="default" />
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'home':
        return renderHome();
      case 'subjects':
        return renderSubjects();
      case 'timer':
        return renderTimer();
      case 'stats':
        return renderStats();
      case 'settings':
        return renderSettings();
      default:
        return renderHome();
    }
  };

  return <View style={styles.screenContainer}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
  cardSubtitle: {
    alignSelf: 'flex-start',
  },
  progressBar: {
    marginVertical: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sessionContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  icon: {
    marginBottom: Spacing.xs,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statValue: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  statLabel: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  profileContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  sectionHeader: {
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  chartCard: {
    padding: Spacing.xl,
    minHeight: 200,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.lg,
  },
  screen: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  screenContainer: {
    flex: 1,
    paddingTop: 100,
    paddingBottom: 100,
  },
  profileCard: {
    marginBottom: Spacing.md,
  },
  timerHeader: {
    marginBottom: Spacing.xl,
  },
  timerCircle: {
    alignSelf: 'center',
    marginBottom: Spacing['3xl'],
  },
});