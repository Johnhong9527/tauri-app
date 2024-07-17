export function copyText(templateString: string) {
    const textArea = document.createElement('textarea');
    textArea.value = templateString;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    // message.success('账户复制成功!');
  }

 export function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    } else if (bytes < 1024 * 1024 * 1024 * 1024) {
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    } else {
        return (bytes / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB';
    }
}