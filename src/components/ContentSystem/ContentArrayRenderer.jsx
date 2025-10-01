// ContentArrayRenderer for Content Creation Lab
// Handles array content with numbering - exact match to TestConstructor

import ContentRenderer from "./ContentRenderer";

/**
 * ContentArrayRenderer - Wrapper component that handles array content with numbering
 *
 * This component processes an array of content items, handles numbering for
 * numberedItem types, and respects numberReset markers while maintaining
 * proper spacing between items.
 */
const ContentArrayRenderer = ({
  content,
  context = "default",
  spacingClass = "mt-2",
  activeHelpLevel,
  showHints,
  moderateHelpConfig,
}) => {
  // Process array content to add numbering
  const processNumbering = (contentArray) => {
    if (!Array.isArray(contentArray)) {
      return contentArray;
    }

    let currentNumber = 0;
    const processedContent = [];

    for (let i = 0; i < contentArray.length; i++) {
      const item = contentArray[i];

      if (!item) {
        processedContent.push(item);
        continue;
      }

      // Reset counter when we hit a numberReset marker
      if (item.type === "numberReset") {
        currentNumber = 0;
        processedContent.push(item);
        continue;
      }

      // Increment and assign number for numbered items
      if (item.type === "numberedItem") {
        currentNumber++;
        // Prepend the number directly to the content string
        processedContent.push({
          ...item,
          type: "text", // Change type to text so it renders as normal text
          content: `${currentNumber}.\u00A0\u00A0${item.content}`,
          originalType: "numberedItem", // Keep track of original type if needed
        });
        continue;
      }

      // For all other types, just pass through
      processedContent.push(item);
    }

    return processedContent;
  };

  // Handle null/empty content
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return null;
  }

  // If not an array, just pass through to ContentRenderer
  if (!Array.isArray(content)) {
    return (
      <ContentRenderer
        content={content}
        context={context}
        activeHelpLevel={activeHelpLevel}
        showHints={showHints}
        moderateHelpConfig={moderateHelpConfig}
      />
    );
  }

  // Process the array to add numbering
  const processedContent = processNumbering(content);

  // Render each item with proper spacing
  return (
    <div>
      {processedContent.map((item, index) => {
        const spacing = index === 0 ? "" : spacingClass;

        return (
          <div key={index} className={spacing}>
            <ContentRenderer
              content={item}
              context={context}
              activeHelpLevel={activeHelpLevel}
              showHints={showHints}
              moderateHelpConfig={moderateHelpConfig}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ContentArrayRenderer;