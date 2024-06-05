import { CSSProperties, useEffect, useRef, useState } from "react";
import { copyText } from "@/utils";
import { Tooltip } from "antd";

export function CopyText({
  width = "200px",
  color = "#1677ff",
  ellipsisLine = 0,
  name,
}: {
  width?: string | undefined;
  color?: string | undefined;
  ellipsisLine?: number;
  name: number|string;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [baseStyle, setBaseStyle] = useState<CSSProperties>({
    width: width,
    color: color,
    wordWrap: "break-word",
    cursor: "pointer",
  });
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight || textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };

    if (ellipsisLine) {
      setBaseStyle((prevStyle) => ({
        ...prevStyle,
        WebkitLineClamp: ellipsisLine,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box'
      }));
    }
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => {
      window.removeEventListener('resize', checkTruncation);
    };
  }, [ellipsisLine, width, color]);

  const content = (
    <div ref={textRef} style={baseStyle} onClick={() => copyText(`${name}`)}>
      {name}
    </div>
  );

  return isTruncated ? <Tooltip placement="top" title={(
    <div>
        <div>点记复制全文:</div>
        {name}
    </div>
  )}>{content}</Tooltip> : content;
}
