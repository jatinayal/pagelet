/**
 * Text Style Utilities
 * ====================
 * 
 * Handles manipulation of inline style marks (bold, italic, underline).
 * 
 * Mark Format:
 * { type: 'bold' | 'italic' | 'underline', start: number, end: number }
 */

/**
 * Apply a mark to the existing marks array.
 * Merges overlapping marks of the same type.
 */
export function applyMark(marks = [], type, start, end) {
    if (start >= end) return marks;

    // Filter out marks of different types
    const otherMarks = marks.filter(m => m.type !== type);

    // Get marks of the same type
    let sameTypeMarks = marks.filter(m => m.type === type);

    // Merge logic:
    // 1. Add new mark
    sameTypeMarks.push({ type, start, end });

    // 2. Sort by start index
    sameTypeMarks.sort((a, b) => a.start - b.start);

    // 3. Merge overlapping/adjacent marks
    const merged = [];
    if (sameTypeMarks.length > 0) {
        let current = sameTypeMarks[0];

        for (let i = 1; i < sameTypeMarks.length; i++) {
            const next = sameTypeMarks[i];

            if (next.start <= current.end) {
                // Overlap or adjacent: extend end
                current.end = Math.max(current.end, next.end);
            } else {
                // No overlap: push current and start new
                merged.push(current);
                current = next;
            }
        }
        merged.push(current);
    }

    // Return combined list
    return [...otherMarks, ...merged];
}

/**
 * Remove a mark type from a specific range.
 * Splits existing marks if necessary.
 */
export function removeMark(marks = [], type, start, end) {
    if (start >= end) return marks;

    const result = [];

    for (const mark of marks) {
        if (mark.type !== type) {
            result.push(mark);
            continue;
        }

        // Case 1: No overlap
        if (mark.end <= start || mark.start >= end) {
            result.push(mark);
            continue;
        }

        // Case 2: Complete removal
        if (mark.start >= start && mark.end <= end) {
            continue;
        }

        // Case 3: Partial removal (split or trim)

        // Left part remains
        if (mark.start < start) {
            result.push({ ...mark, end: start });
        }

        // Right part remains
        if (mark.end > end) {
            result.push({ ...mark, start: end });
        }
    }

    return result;
}

/**
 * Adjust mark positions when text changes (insertion/deletion).
 * Original function kept for backward compatibility if needed elsewhere.
 */
export function adjustMarks(marks = [], changeIndex, delta) {
    if (delta === 0) return marks;

    return marks.map(mark => {
        if (changeIndex <= mark.start) {
            return {
                ...mark,
                start: mark.start + delta,
                end: mark.end + delta
            };
        }
        if (changeIndex < mark.end) {
            return { ...mark, end: mark.end + delta };
        }
        return mark;
    }).filter(mark => mark.end > mark.start);
}

/**
 * Accurately calculate text diff bounds to preserve marks during paste and selection-replacement.
 * 
 * @param {Array} marks - Current marks
 * @param {string} oldText - Text before the change
 * @param {string} newText - Text after the change
 */
export function adjustMarksForChange(marks = [], oldText = '', newText = '') {
    if (oldText === newText) return marks;

    // 1. Find the boundaries of the change
    let start = 0;
    while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) {
        start++;
    }

    let oldEnd = oldText.length;
    let newEnd = newText.length;
    while (oldEnd > start && newEnd > start && oldText[oldEnd - 1] === newText[newEnd - 1]) {
        oldEnd--;
        newEnd--;
    }

    const deletedLength = oldEnd - start;
    const insertedLength = newEnd - start;

    if (deletedLength === 0 && insertedLength === 0) return marks;

    // 2. Helper to map indices after deletion
    const mapPointAfterDeletion = (p) => {
        const deleteEnd = start + deletedLength;
        if (p <= start) return p;
        if (p >= deleteEnd) return p - deletedLength;
        return start; // Pointers inside the deleted range collapse to the start of the deletion
    };

    // 3. Process Deletions
    let resultingMarks = marks;
    if (deletedLength > 0) {
        resultingMarks = resultingMarks.map(mark => ({
            ...mark,
            start: mapPointAfterDeletion(mark.start),
            end: mapPointAfterDeletion(mark.end)
        })).filter(m => m.end > m.start);
    }

    // 4. Process Insertions
    if (insertedLength > 0) {
        resultingMarks = resultingMarks.map(mark => {
            // Mark is entirely after the insertion point
            if (start <= mark.start) {
                return { ...mark, start: mark.start + insertedLength, end: mark.end + insertedLength };
            }
            // Mark encompasses the insertion point
            else if (start < mark.end) {
                return { ...mark, end: mark.end + insertedLength };
            }
            // Mark is entirely before the insertion point
            return mark;
        });
    }

    return resultingMarks;
}
