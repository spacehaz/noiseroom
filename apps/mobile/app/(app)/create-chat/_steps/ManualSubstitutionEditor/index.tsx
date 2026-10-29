import React, { useMemo } from 'react';
import { View, Dimensions, Text as RNText } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Button } from '@/components';
import { ITEM_SIZE, STEP, SPRING, buildCharSet } from './_config';
import { styles } from './_styles';
import { DraggableItemProps, ManualSubstitutionEditorProps } from './_types';

const DraggableItem = React.memo(function DraggableItem({
  itemIndex,
  char,
  cols,
  totalItems,
  sharedOrder,
  activeItemIdx,
}: DraggableItemProps) {
  const posX = useSharedValue((itemIndex % cols) * STEP);
  const posY = useSharedValue(Math.floor(itemIndex / cols) * STEP);
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const totalRows = Math.ceil(totalItems / cols);

  useAnimatedReaction(
    () => (activeItemIdx.value === itemIndex ? -1 : sharedOrder.value.indexOf(itemIndex)),
    (pos) => {
      if (pos === -1) return;
      posX.value = withSpring((pos % cols) * STEP, SPRING);
      posY.value = withSpring(Math.floor(pos / cols) * STEP, SPRING);
    },
  );

  const gesture = Gesture.Pan()
    .onStart(() => {
      activeItemIdx.value = itemIndex;
      dragStartX.value = posX.value;
      dragStartY.value = posY.value;
    })
    .onChange((e) => {
      posX.value = dragStartX.value + e.translationX;
      posY.value = dragStartY.value + e.translationY;

      const cx = posX.value + ITEM_SIZE * 0.5;
      const cy = posY.value + ITEM_SIZE * 0.5;
      const hCol = Math.max(0, Math.min(cols - 1, Math.floor(cx / STEP)));
      const hRow = Math.max(0, Math.min(totalRows - 1, Math.floor(cy / STEP)));
      const hPos = Math.min(hRow * cols + hCol, totalItems - 1);

      const cur = sharedOrder.value.indexOf(itemIndex);
      if (hPos !== cur) {
        const next = [...sharedOrder.value];
        next.splice(cur, 1);
        next.splice(hPos, 0, itemIndex);
        sharedOrder.value = next;
      }
    })
    .onEnd(() => {
      activeItemIdx.value = -1;
      const pos = sharedOrder.value.indexOf(itemIndex);
      posX.value = withSpring((pos % cols) * STEP, SPRING);
      posY.value = withSpring(Math.floor(pos / cols) * STEP, SPRING);
    });

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: activeItemIdx.value === itemIndex ? 100 : 1,
    opacity: activeItemIdx.value === itemIndex ? 1 : 0.8,
    transform: [
      { translateX: posX.value },
      { translateY: posY.value },
      { scale: activeItemIdx.value === itemIndex ? 1.15 : 1 },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animStyle}>
        <View style={styles.pinkBox}>
          <RNText style={styles.boxChar}>{char}</RNText>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

export function ManualSubstitutionEditor({
  alphabet,
  onComplete,
  onCancel,
}: ManualSubstitutionEditorProps) {
  const chars = useMemo(() => buildCharSet(alphabet), [alphabet]);
  const N = chars.length;

  const available = Dimensions.get('window').width - 64;
  const cols = Math.floor(available / STEP);
  const gridWidth = cols * STEP;
  const gridHeight = Math.ceil(N / cols) * STEP;

  const sharedOrder = useSharedValue<number[]>(chars.map((_, i) => i));
  const activeItemIdx = useSharedValue(-1);

  function handleConfirm() {
    const order = sharedOrder.value;
    const map: Record<string, string> = {};
    for (let i = 0; i < N; i++) {
      map[chars[i]!] = chars[order[i]!]!;
    }
    onComplete(map);
  }

  return (
    <View style={styles.container}>
      <RNText style={styles.hint}>
        drag pink tiles to remap{'\n'}green = source · pink = cipher
      </RNText>
      <View style={[styles.grid, { width: gridWidth, height: gridHeight }]}>
        {chars.map((char, i) => (
          <View
            key={`g-${i}`}
            style={[styles.greenBox, { left: (i % cols) * STEP, top: Math.floor(i / cols) * STEP }]}
          >
            <RNText style={styles.boxChar}>{char}</RNText>
          </View>
        ))}
        {chars.map((char, i) => (
          <DraggableItem
            key={`p-${i}`}
            itemIndex={i}
            char={char}
            cols={cols}
            totalItems={N}
            sharedOrder={sharedOrder}
            activeItemIdx={activeItemIdx}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <Button title="confirm" onClick={handleConfirm} />
        <Button title="← back" onClick={onCancel} variant="secondary" />
      </View>
    </View>
  );
}
