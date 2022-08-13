import React from 'react'
import classNames from 'classnames'
import Moment from 'react-moment'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '../../../store/hooks'
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  GridItem,
  Button,
} from '@patternfly/react-core'

import { FeedFile } from '@fnndsc/chrisapi'
import { MdFileDownload } from 'react-icons/md'
import {
  AiFillFileImage,
  AiFillFileText,
  AiFillFile,
  AiFillFolder,
  AiOutlineExpandAlt,
  AiFillCloseCircle,
} from 'react-icons/ai'
import { FaFileCode, FaFilm } from 'react-icons/fa'
import {
  Table,
  TableHeader,
  TableBody,
  cellWidth,
  truncate,
} from '@patternfly/react-table'
import FileDetailView from '../Preview/FileDetailView'
import FileViewerModel from '../../../api/models/file-viewer.model'
import { getFileExtension } from '../../../api/models/file-explorer.model'
import { FileBrowserProps, FileBrowserState } from './types'

import {
  setSelectedFile,
  setSelectedFolder,
} from '../../../store/explorer/actions'
import { BiHorizontalCenter } from 'react-icons/bi'
import { getXtkFileMode } from '../../detailedView/displays/XtkViewer/XtkViewer'
import { Alert, Progress } from 'antd'
import { file } from 'jszip'

const FileBrowser = (props: FileBrowserProps) => {
  const {
    pluginFilesPayload,
    handleFileClick,
    selected,
    handleFileBrowserToggle,
    handleDicomViewerOpen,
    handleXtkViewerOpen,
  } = props
  const selectedFile = useTypedSelector((state) => state.explorer.selectedFile)
  const dispatch = useDispatch()

  const { files, folders, path } = pluginFilesPayload
  const cols = [
    { title: '' },
    { title: 'Name', transforms: [cellWidth(40)], cellTransforms: [truncate] },
    { title: 'Creation Date' },
    { title: 'Size' },
    { title: '' },
  ]

  const generateTableRow = (item: string | FeedFile) => {
    let type, icon, date, fsize, fileName
    type = 'UNKNOWN FORMAT'

    if (typeof item === 'string') {
      type = 'dir'
      icon = getIcon(type)
      fileName = item
    } else {
      fileName = item.data.fname.split('/').slice(-1)
      if (fileName.indexOf('.') > -1) {
        type = fileName.split('.').splice(-1)[0].toUpperCase()
      }
      fsize = item.data.fsize
      icon = getIcon(type)
      date = item.data.creation_date
    }

    const iconRow = {
      title: icon,
    }

    const creationDate = (
      <Moment format="DD MMM YYYY , HH:mm">
        {
          //@ts-ignore
          date && date
        }
      </Moment>
    )
    const name = {
      title: fileName,
    }

    const size = {
      title: fsize,
    }

    const download = {
      title: <MdFileDownload className="download-file-icon" />,
    }

    const creation_date = {
      title: creationDate,
    }

    return {
      cells: [iconRow, name, creation_date, size, download],
    }
  }

  const { id, plugin_name } = selected.data
  const pathSplit = path && path.split(`/${plugin_name}_${id}/`)
  const breadcrumb = path ? pathSplit[1].split('/') : []

  const generateBreadcrumb = (value: string, index: number) => {
    const onClick = (e: React.MouseEvent) => {
      if (index === breadcrumb.length - 1) {
        return
      } else {
        const findIndex = breadcrumb.findIndex((path) => path === value)
        if (findIndex !== -1) {
          const newPathList = breadcrumb.slice(0, findIndex + 1)
          const combinedPathList = [
            ...pathSplit[0].split('/'),
            `${plugin_name}_${id}`,
            ...newPathList,
          ]
          handleFileClick(combinedPathList.join('/'))
        }
      }
    }

    return (
      <BreadcrumbItem
        className="file-browser__header--crumb"
        showDivider={true}
        key={index}
        onClick={onClick}
        to={index === breadcrumb.length - 1 ? undefined : '#'}
      >
        {value}
      </BreadcrumbItem>
    )
  }

  const items = files && folders ? [...files, ...folders] : []
  const rows = items.map(generateTableRow)

  const previewPanel = (
    <>
      {selectedFile && (
        <>
          <HeaderPanel
            handleFileBrowserOpen={handleFileBrowserToggle}
            handleDicomViewerOpen={handleDicomViewerOpen}
            handleXtkViewerOpen={handleXtkViewerOpen}
            expandDrawer={() => {
              console.log('Expand')
            }}
            selectedFile={selectedFile}
          />

          <FileDetailView selectedFile={selectedFile} preview="small" />
        </>
      )}
    </>
  )

  return (
    <Grid hasGutter className="file-browser">
      <GridItem
        xl2={5}
        xl2RowSpan={12}
        xl={6}
        xlRowSpan={12}
        lg={4}
        lgRowSpan={12}
        md={4}
        mdRowSpan={12}
        sm={12}
        smRowSpan={12}
        className="file-browser__firstGrid"
      >
        <div className="file-browser__header">
          <div className="file-browser__header--breadcrumbContainer">
            <Breadcrumb>{breadcrumb.map(generateBreadcrumb)}</Breadcrumb>
          </div>
          <div className="file-browser__header__info">
            <span className="files-browser__header--fileCount">
              {items.length > 1
                ? `(${items.length} items)`
                : `(${items.length} item)`}
            </span>
          </div>
        </div>
        <Table
          className="file-browser__table"
          aria-label="file-browser-table"
          variant="compact"
          cells={cols}
          rows={rows}
        >
          <TableHeader />
          <TableBody
            onRowClick={(event: any, rows: any, rowData: any) => {
              const rowIndex = rowData.rowIndex
              const item = items[rowIndex]

              if (typeof item === 'string') {
                handleFileClick(`${path}/${rows.name.title}`)
              } else {
                dispatch(setSelectedFile(item))
              }
            }}
          />
        </Table>
      </GridItem>
      <GridItem
        xl2={7}
        xl2RowSpan={12}
        xl={6}
        xlRowSpan={12}
        lg={8}
        lgRowSpan={12}
        md={8}
        mdRowSpan={12}
        sm={12}
        smRowSpan={12}
        className="file-browser__grid2"
      >
        {selectedFile && previewPanel}
      </GridItem>
    </Grid>
  )
}

export default FileBrowser

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'dir':
      return <AiFillFolder />
    case 'dcm':
    case 'jpg':
    case 'png':
      return <AiFillFileImage />
    case 'html':
    case 'json':
      return <FaFileCode />
    case 'txt':
      return <AiFillFileText />
    default:
      return <AiFillFile />
  }
}

interface HeaderPanelProps {
  handleDicomViewerOpen: () => void
  handleXtkViewerOpen: () => void
  handleFileBrowserOpen: () => void
  expandDrawer: (panel: string) => void
  selectedFile: FeedFile
}

const HeaderPanel = (props: HeaderPanelProps) => {
  const {
    handleDicomViewerOpen,
    handleXtkViewerOpen,
    handleFileBrowserOpen,
    expandDrawer,
    selectedFile,
  } = props

  const imageFileTypes = ['dcm', 'png', 'jpg', 'nii', 'gz', 'jpeg']
  const fileType = getFileExtension(selectedFile.data.fname)

  return (
    <div className="header-panel__buttons">
      <div className="header-panel__buttons--toggleViewer">
        <Button
          variant="link"
          onClick={handleFileBrowserOpen}
          icon={<AiOutlineExpandAlt />}
        >
          Maximize
        </Button>
        {!fileType && (
          <Alert
            type="info"
            message="Please select a file to see the list of available viewers"
          />
        )}
        {fileType && imageFileTypes.includes(fileType) && (
          <Button
            variant="link"
            onClick={handleDicomViewerOpen}
            icon={<FaFilm />}
          >
            Open Image Viewer
          </Button>
        )}
        {fileType && getXtkFileMode(fileType) && (
          <Button
            variant="link"
            onClick={handleXtkViewerOpen}
            icon={<BiHorizontalCenter />}
          >
            Open XTK Viewer
          </Button>
        )}
      </div>
      <div className="header-panel__buttons--togglePanel">
        <Button
          onClick={() => expandDrawer('bottom_panel')}
          variant="tertiary"
          type="button"
          icon={<AiFillCloseCircle />}
        />
      </div>
    </div>
  )
}
