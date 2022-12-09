import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
// import {file} from "@tauri-apps/api/tauri";

import { open, message } from '@tauri-apps/api/dialog';
import { tauri } from "@tauri-apps/api";
// import { appDataDir } from '@tauri-apps/api/path';

export default function Finder() {
	const [selectPath, setSelectPath] = useState<string>('')
	useEffect(() => {
	if(selectPath) {

	}
	}, [selectPath])
	async function selectDirectory() {

		const selected = await open({
		  directory: true,
		//   multiple: true,
		//   defaultPath: await appDataDir(),
		});
		
		if (Array.isArray(selected)) {
			setSelectPath(selected.toString());	
		  // user selected multiple directories
		} else if (selected === null) {
		  // user cancelled the selection
		} else {
		  // user selected a single directory
		  setSelectPath(selected);

		//   const result = await tauri.execute({
		// 	cmd: 'myCommand',
		// 	args: ['arg1 value', 123]
		//   })
		   await invoke('file_path', {name: selected, parentid: ''})
		//   file_path
		}
	}

	return (
		<div>
			<div>finder</div>
			<button onClick={() => selectDirectory()}>run</button>
			<div>selectPath:</div>
			<div>
				{selectPath}
			</div>
		</div>
	)
}