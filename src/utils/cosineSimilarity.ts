export const cosineSimilarity = (left: number[], right: number[]): number => {
  if (!left.length || !right.length || left.length !== right.length) return 0;

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let i = 0; i < left.length; i += 1) {
    const leftValue = left[i];
    const rightValue = right[i];

    dot += leftValue * rightValue;
    leftNorm += leftValue * leftValue;
    rightNorm += rightValue * rightValue;
  }

  if (!leftNorm || !rightNorm) return 0;

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
};
