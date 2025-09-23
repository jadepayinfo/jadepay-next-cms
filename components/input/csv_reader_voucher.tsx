import React, { useState, CSSProperties } from "react";

import {
  useCSVReader,
  lightenDarkenColor,
} from "react-papaparse";
import ButtonOutline from "../buttons/button_outline";
import { IconClose, IconImport } from "../icon";

const GREY = "#CCC";
const GREY_LIGHT = "rgba(255, 255, 255, 0.4)";
const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);

const GREY_DIM = "#686868";

const styles = {
  zone: {
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "underline",
  } as CSSProperties,
  file: {
    background: "linear-gradient(to bottom, #EEE, #DDD)",
    // borderRadius: 20,
    display: "flex",
    height: 50,
    width: 200,
    position: "relative",
    zIndex: 10,
    flexDirection: "column",
    justifyContent: "center",
  } as CSSProperties,
  info: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    // paddingLeft: 10,
    // paddingRight: 10
  } as CSSProperties,
  size: {
    // marginBottom: '0.5em',
    justifyContent: "center",
    display: "flex",
    fontSize: 12,
  } as CSSProperties,
  name: {
    borderRadius: 3,
    fontSize: 12,
    // marginBottom: '0.5em'
  } as CSSProperties,
  progressBar: {
    bottom: 14,
    position: "absolute",
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10,
  } as CSSProperties,
  zoneHover: {
    borderColor: GREY_DIM,
  } as CSSProperties,
  default: {
    borderColor: GREY,
  } as CSSProperties,
  remove: {
    height: 23,
    position: "absolute",
    right: 6,
    top: 6,
    width: 23,
  } as CSSProperties,
};

export default function CSVReaderVoucher({
  label = "Drop CSV file here or click to upload",
  UploadDone,
}: {
  label?: string;
  UploadDone: (phoneNumber: any[]) => void;
}) {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );

  const onUpload = (results: any) => {
    console.log("-------------CSV--------------");
    console.log(results);
    console.log("------------------------------");
    const { data: rawData } = results;
    if (rawData) {
      const data = compressData(rawData);
      UploadDone(data);
    }
    setZoneHover(false);
  };

  const compressData = (data: any | string[]) => {
    let dataMapping = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      dataMapping.push({
        code: row[0],
        expired_at: 4102491600, // fix expired_date to unlimit
      });
    }

    return dataMapping;
  };

  return (
    <CSVReader
      onUploadAccepted={onUpload}
      onDragOver={(event: DragEvent) => {
        event.preventDefault();
        setZoneHover(true);
      }}
      onDragLeave={(event: DragEvent) => {
        event.preventDefault();
        setZoneHover(false);
      }}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
        Remove,
      }: any) => (
        <>
          <div
            {...getRootProps()}
            style={Object.assign(
              {},
              styles.zone,
              zoneHover && styles.zoneHover
            )}
          >
            {acceptedFile ? (
              <>
                <div className="flex">
                  <ButtonOutline size="md" type="button">
                    <IconImport className={`text-[24px]`} />
                    {acceptedFile.name}
                  </ButtonOutline>
                  <div
                    className="ml-2 flex justify-center items-center"
                    {...getRemoveFileProps()}
                    // style={styles.remove}
                    onMouseOver={(event: Event) => {
                      event.preventDefault();
                      setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                    }}
                    onMouseOut={(event: Event) => {
                      event.preventDefault();
                      setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                    }}
                  >
                    <IconClose className={`text-[20px] text-primary icon`} />
                  </div>
                </div>
                {/* <div style={styles.file}>
                  <div style={styles.info}>
                    <span style={styles.name}>{acceptedFile.name}</span>
                    <span style={styles.size}>
                      Size:{formatFileSize(acceptedFile.size)}
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <ProgressBar />
                  </div>
                  <div
                    {...getRemoveFileProps()}
                    style={styles.remove}
                    onMouseOver={(event: Event) => {
                      event.preventDefault();
                      setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                    }}
                    onMouseOut={(event: Event) => {
                      event.preventDefault();
                      setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                    }}
                  >
                    <Remove color={removeHoverColor} />
                  </div>
                </div> */}
              </>
            ) : (
              <ButtonOutline size="md" type="button">
                <IconImport className={`text-[24px]`} />
                {label}
              </ButtonOutline>
            )}
          </div>
        </>
      )}
    </CSVReader>
  );
}
