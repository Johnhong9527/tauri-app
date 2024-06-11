import {
    File_APPLICATION_TYPE,
    File_AUDIO_TYPE,
    File_COMPRESSED_TYPE,
    File_DOCUMENT_TYPE,
    File_IMAGE_TYPE,
    File_VIDEO_TYPE,
  } from "@/config";
  
export const fileTypeList = [
    {
      name: "音频",
      valus: File_AUDIO_TYPE,
    },
    {
      name: "视频",
      valus: File_VIDEO_TYPE,
    },
    {
      name: "文档",
      valus: File_DOCUMENT_TYPE,
    },
    {
      name: "图片",
      valus: File_IMAGE_TYPE,
    },
    {
      name: "应用程序",
      valus: File_APPLICATION_TYPE,
    },
    {
      name: "压缩包",
      valus: File_COMPRESSED_TYPE,
    },
  ];

  export  const fileSizeList = [
    {
      name: "巨大（4GB+）",
      values: [4294967296, Infinity], // 从4GB开始到无限大
    },
    {
      name: "特大（1~4GB-）",
      values: [1073741824, 4294967295], // 从1GB到小于4GB
    },
    {
      name: "大（128MB ~ 1GB-）",
      values: [134217728, 1073741823], // 从128MB到小于1GB
    },
    {
      name: "中（1MB ~ 128MB-）",
      values: [1048576, 134217727], // 从1MB到小于128MB
    },
    {
      name: "小（16KB ~ 1MB-）",
      values: [16384, 1048575], // 从16KB到小于1MB
    },
    {
      name: "微小（1B ~ 16KB-）",
      values: [1, 16383], // 从1B到小于16KB
    },
    {
      name: "空文件及目录",
      values: [0, 0], // 特殊类型，表示空文件或目录，无实际大小
    },
  ];