import React, { useState, useEffect } from 'react';
import {
  Card,
  Upload,
  Button,
  List,
  Space,
  Typography,
  Tag,
  Modal,
  Input,
  Select,
  message,
  Tooltip,
  Progress,
  Popconfirm,
  Row,
  Col,
  Alert,
  Spin,
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import apiClient from '@services/apiClient';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TaskAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  type: 'instruction' | 'template' | 'reference' | 'example' | 'resource';
  description?: string;
  downloadCount: number;
  isActive: boolean;
  uploadedAt: string;
  fileExtension: string;
  sizeInMB: number;
  isImage: boolean;
  isDocument: boolean;
  isSpreadsheet: boolean;
  isPresentation: boolean;
}

interface TaskAttachmentManagerProps {
  taskId: string;
  isVisible: boolean;
  onClose: () => void;
  onAttachmentChange?: () => void;
}

const AttachmentTypeLabels = {
  instruction: { label: 'Instrucciones', color: 'blue', icon: <FileTextOutlined /> },
  template: { label: 'Plantilla', color: 'green', icon: <FileExcelOutlined /> },
  reference: { label: 'Referencia', color: 'purple', icon: <FilePdfOutlined /> },
  example: { label: 'Ejemplo', color: 'orange', icon: <FileImageOutlined /> },
  resource: { label: 'Recurso', color: 'cyan', icon: <FilePptOutlined /> },
};

const getFileIcon = (attachment: TaskAttachment) => {
  if (attachment.isImage) return <FileImageOutlined style={{ color: '#52c41a' }} />;
  if (attachment.isDocument) return <FilePdfOutlined style={{ color: '#f5222d' }} />;
  if (attachment.isSpreadsheet) return <FileExcelOutlined style={{ color: '#722ed1' }} />;
  if (attachment.isPresentation) return <FilePptOutlined style={{ color: '#fa8c16' }} />;
  if (attachment.fileExtension === 'zip' || attachment.fileExtension === 'rar') {
    return <FileZipOutlined style={{ color: '#faad14' }} />;
  }
  return <FileTextOutlined style={{ color: '#1890ff' }} />;
};

const TaskAttachmentManager: React.FC<TaskAttachmentManagerProps> = ({
  taskId,
  isVisible,
  onClose,
  onAttachmentChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<TaskAttachment | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState<string>('');

  useEffect(() => {
    if (isVisible && taskId) {
      fetchAttachments();
    }
  }, [isVisible, taskId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tasks/${taskId}/attachments`);
      setAttachments(response.data);
    } catch (error: any) {
      console.error('Error fetching attachments:', error);
      message.error('Error al cargar los archivos adjuntos');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'files',
    multiple: true,
    showUploadList: false,
    customRequest: async ({ file, onProgress, onSuccess, onError }) => {
      try {
        setUploading(true);
        
        const formData = new FormData();
        formData.append('files', file as File);

        const response = await apiClient.post(
          `/tasks/${taskId}/attachments`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              setUploadProgress(progress);
              onProgress?.({ percent: progress });
            },
          }
        );

        onSuccess?.(response.data);
        message.success(`Archivo ${(file as File).name} subido exitosamente`);
        fetchAttachments();
        onAttachmentChange?.();
      } catch (error: any) {
        console.error('Error uploading file:', error);
        onError?.(error);
        message.error(`Error al subir ${(file as File).name}`);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    beforeUpload: (file) => {
      // Validar tamaño de archivo (100MB máximo)
      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isLt100M) {
        message.error('El archivo debe ser menor a 100MB');
        return false;
      }

      // Validar tipos de archivo permitidos
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/zip',
        'application/x-rar-compressed',
      ];

      if (!allowedTypes.includes(file.type)) {
        message.error('Tipo de archivo no permitido');
        return false;
      }

      return true;
    },
  };

  const handleDownload = async (attachmentId: string, originalName: string) => {
    try {
      const response = await apiClient.get(
        `/tasks/attachments/${attachmentId}/download`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Archivo descargado exitosamente');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      message.error('Error al descargar el archivo');
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      await apiClient.delete(`/tasks/attachments/${attachmentId}`);
      message.success('Archivo eliminado exitosamente');
      fetchAttachments();
      onAttachmentChange?.();
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      message.error('Error al eliminar el archivo');
    }
  };

  const handleEdit = (attachment: TaskAttachment) => {
    setEditingAttachment(attachment);
    setEditDescription(attachment.description || '');
    setEditType(attachment.type);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAttachment) return;

    try {
      await apiClient.patch(`/tasks/attachments/${editingAttachment.id}`, {
        description: editDescription,
        type: editType,
      });

      message.success('Archivo actualizado exitosamente');
      setEditModalVisible(false);
      fetchAttachments();
      onAttachmentChange?.();
    } catch (error: any) {
      console.error('Error updating attachment:', error);
      message.error('Error al actualizar el archivo');
    }
  };

  const getTotalSize = () => {
    return attachments.reduce((total, attachment) => total + attachment.sizeInMB, 0);
  };

  const getTypeDistribution = () => {
    const distribution: { [key: string]: number } = {};
    attachments.forEach(attachment => {
      distribution[attachment.type] = (distribution[attachment.type] || 0) + 1;
    });
    return distribution;
  };

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          Gestión de Archivos Adjuntos
        </Space>
      }
      open={isVisible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Upload Section */}
        <Card className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Upload {...uploadProps} disabled={uploading}>
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  size="large"
                  type="primary"
                >
                  {uploading ? 'Subiendo...' : 'Subir Archivos'}
                </Button>
              </Upload>
              {uploading && (
                <Progress
                  percent={uploadProgress}
                  size="small"
                  className="mt-2"
                />
              )}
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary">
                  <InfoCircleOutlined /> Formatos permitidos: PDF, Word, Excel, PowerPoint, imágenes, ZIP
                </Text>
                <Text type="secondary">
                  Tamaño máximo: 100MB por archivo
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Statistics */}
        {attachments.length > 0 && (
          <Card className="mb-4" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Space>
                  <FileTextOutlined />
                  <Text strong>{attachments.length}</Text>
                  <Text type="secondary">archivos</Text>
                </Space>
              </Col>
              <Col span={8}>
                <Space>
                  <Text strong>{getTotalSize().toFixed(1)} MB</Text>
                  <Text type="secondary">total</Text>
                </Space>
              </Col>
              <Col span={8}>
                <Space wrap>
                  {Object.entries(getTypeDistribution()).map(([type, count]) => (
                    <Tag key={type} color={AttachmentTypeLabels[type as keyof typeof AttachmentTypeLabels]?.color}>
                      {AttachmentTypeLabels[type as keyof typeof AttachmentTypeLabels]?.label}: {count}
                    </Tag>
                  ))}
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Attachments List */}
        <Card title="Archivos Adjuntos">
          {loading ? (
            <div className="text-center py-8">
              <Spin tip="Cargando archivos..." />
            </div>
          ) : attachments.length === 0 ? (
            <Alert
              message="No hay archivos adjuntos"
              description="Sube archivos para que los estudiantes puedan acceder a materiales adicionales."
              type="info"
              showIcon
            />
          ) : (
            <List
              dataSource={attachments}
              renderItem={(attachment) => (
                <List.Item
                  key={attachment.id}
                  actions={[
                    <Tooltip title="Descargar">
                      <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => handleDownload(attachment.id, attachment.originalName)}
                      />
                    </Tooltip>,
                    <Tooltip title="Editar">
                      <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(attachment)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="¿Eliminar este archivo?"
                      description="Esta acción no se puede deshacer"
                      onConfirm={() => handleDelete(attachment.id)}
                      okText="Eliminar"
                      cancelText="Cancelar"
                    >
                      <Tooltip title="Eliminar">
                        <Button
                          icon={<DeleteOutlined />}
                          size="small"
                          danger
                        />
                      </Tooltip>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={getFileIcon(attachment)}
                    title={
                      <Space>
                        <Text strong>{attachment.originalName}</Text>
                        <Tag color={AttachmentTypeLabels[attachment.type]?.color}>
                          {AttachmentTypeLabels[attachment.type]?.label}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        {attachment.description && (
                          <Text type="secondary">{attachment.description}</Text>
                        )}
                        <Space>
                          <Text type="secondary">
                            {attachment.sizeInMB.toFixed(1)} MB
                          </Text>
                          <Text type="secondary">•</Text>
                          <Text type="secondary">
                            {attachment.downloadCount} descargas
                          </Text>
                          <Text type="secondary">•</Text>
                          <Text type="secondary">
                            {new Date(attachment.uploadedAt).toLocaleDateString('es-ES')}
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Edit Modal */}
        <Modal
          title="Editar Archivo"
          open={editModalVisible}
          onOk={handleSaveEdit}
          onCancel={() => setEditModalVisible(false)}
          okText="Guardar"
          cancelText="Cancelar"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <label>Tipo de archivo:</label>
              <Select
                value={editType}
                onChange={setEditType}
                style={{ width: '100%', marginTop: 8 }}
              >
                {Object.entries(AttachmentTypeLabels).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value.icon} {value.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label>Descripción:</label>
              <TextArea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descripción del archivo (opcional)"
                rows={3}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        </Modal>
      </div>
    </Modal>
  );
};

export default TaskAttachmentManager;