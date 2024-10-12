export function copyText(templateString: string) {
  const textArea = document.createElement("textarea");
  textArea.value = templateString;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
  // message.success('账户复制成功!');
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return bytes + " bytes";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + " KB";
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  } else if (bytes < 1024 * 1024 * 1024 * 1024) {
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
  } else {
    return (bytes / 1024 / 1024 / 1024 / 1024).toFixed(2) + " TB";
  }
}

export function generateRandomChineseString() {
  const chineseCharacters =
    "的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学天敌实全展情明问力理心她本前开但气向道命此变条只没结解教性应关点战自外刀术业已民度思品得家知军等物制数果四期立及最由提长东破如被服首式况色根值真住向双内程设求现太文社并高把政十特利入从表量重并西名认处让员构常准联育观务满热志具响指传装统规写保劳记取称务群务深专清今型易视近运及展织研决益调究达术极环破克交直具载息住随收复北器活设线育河传千变万化绿水青山风和日丽春华秋实鸟语花香";
  const length = Math.floor(Math.random() * 5) + 4;
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chineseCharacters.length);
    randomString += chineseCharacters.charAt(randomIndex);
  }
  return randomString;
}
