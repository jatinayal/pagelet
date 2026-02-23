/**
 * RichText Component
 * ==================
 * 
 * Renders text with inline styles (bold, italic, underline) based on `marks`.
 * Used for "View Mode" in text blocks.
 * 
 * Performance:
 * - Uses simple CSS classes
 * - Avoids complex parsing/regex
 * - Handles overlapping ranges by segmenting text
 */

'use client';

export function RichText({ text = '', marks = [] }) {
    if (!marks || marks.length === 0) {
        return <span className="whitespace-pre-wrap">{text}</span>;
    }

    // Sort marks by start position
    const sortedMarks = [...marks].sort((a, b) => a.start - b.start);

    // Create segments for rendering
    // Each segment: { text: string, styles: Set<string> }
    const segments = [];
    let currentStyles = new Set();

    // We iterate through all "points of interest" (start/end of marks)
    const points = new Set([0, text.length]);
    sortedMarks.forEach(m => {
        points.add(Math.max(0, Math.min(text.length, m.start)));
        points.add(Math.max(0, Math.min(text.length, m.end)));
    });

    const sortedPoints = Array.from(points).sort((a, b) => a - b);

    for (let i = 0; i < sortedPoints.length - 1; i++) {
        const start = sortedPoints[i];
        const end = sortedPoints[i + 1];

        if (start === end) continue;

        // Determine active styles for this segment
        const activeStyles = new Set();
        sortedMarks.forEach(m => {
            if (m.start <= start && m.end >= end) {
                activeStyles.add(m.type);
            }
        });

        segments.push({
            text: text.substring(start, end),
            styles: activeStyles
        });
    }

    return (
        <span className="whitespace-pre-wrap break-all">
            {segments.map((seg, i) => {
                const styleClasses = [];
                if (seg.styles.has('bold')) styleClasses.push('font-bold');
                if (seg.styles.has('italic')) styleClasses.push('italic');
                if (seg.styles.has('underline')) styleClasses.push('underline underline-offset-4 decoration-indigo-500/30');

                return (
                    <span
                        key={i}
                        className={styleClasses.join(' ')}
                    >
                        {seg.text}
                    </span>
                );
            })}
        </span>
    );
}

export default RichText;
