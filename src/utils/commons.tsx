export function copyText(templateString: string) {
    const textArea = document.createElement('textarea');
    textArea.value = templateString;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    // message.success('账户复制成功!');
  }