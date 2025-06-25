import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Tag,
  Dropdown,
  Modal,
  message,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Empty,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  ImportOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  ShareAltOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Rubric, useRubrics } from '../../hooks/useRubrics';
import RubricEditor from '../../components/rubrics/RubricEditor';
import RubricImporter from '../../components/rubrics/RubricImporter';
import RubricGrid from '../../components/rubrics/RubricGrid';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface RubricsPageProps {}

const RubricsPage: React.FC<RubricsPageProps> = () => {
  const {
    rubrics,
    loading,
    error,
    fetchRubrics,
    deleteRubric,
    publishRubric,
    updateRubric
  } = useRubrics();

  const [filteredRubrics, setFilteredRubrics] = useState<Rubric[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  
  // Modals
  const [editorVisible, setEditorVisible] = useState(false);
  const [importerVisible, setImporterVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  
  // Estados de edición
  const [editingRubric, setEditingRubric] = useState<Rubric | null>(null);
  const [viewingRubric, setViewingRubric] = useState<Rubric | null>(null);

  // Cargar rúbricas al montar el componente
  useEffect(() => {
    fetchRubrics(true); // Incluir templates
  }, []);

  // Filtrar rúbricas
  useEffect(() => {
    let filtered = [...rubrics];

    // Filtro por texto
    if (searchText) {
      filtered = filtered.filter(rubric =>
        rubric.name.toLowerCase().includes(searchText.toLowerCase()) ||
        rubric.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rubric => rubric.status === statusFilter);
    }

    // Filtro por template
    if (templateFilter !== 'all') {
      const isTemplate = templateFilter === 'template';
      filtered = filtered.filter(rubric => rubric.isTemplate === isTemplate);
    }

    setFilteredRubrics(filtered);
  }, [rubrics, searchText, statusFilter, templateFilter]);

  // Estadísticas
  const stats = {
    total: rubrics.length,
    active: rubrics.filter(r => r.status === 'active').length,
    drafts: rubrics.filter(r => r.status === 'draft').length,
    templates: rubrics.filter(r => r.isTemplate).length,
  };

  // Crear nueva rúbrica
  const handleNewRubric = () => {
    setEditingRubric(null);
    setEditorVisible(true);
  };

  // Importar rúbrica
  const handleImportRubric = () => {
    setImporterVisible(true);
  };

  // Editar rúbrica
  const handleEditRubric = (rubric: Rubric) => {
    setEditingRubric(rubric);
    setEditorVisible(true);
  };

  // Ver rúbrica
  const handleViewRubric = (rubric: Rubric) => {
    setViewingRubric(rubric);
    setViewerVisible(true);
  };

  // Duplicar rúbrica
  const handleDuplicateRubric = async (rubric: Rubric) => {
    const duplicatedRubric = {
      ...rubric,
      name: `${rubric.name} (Copia)`,
      status: 'draft' as const,
      isTemplate: false
    };
    
    setEditingRubric(duplicatedRubric);
    setEditorVisible(true);
  };

  // Publicar rúbrica
  const handlePublishRubric = async (rubric: Rubric) => {
    Modal.confirm({
      title: '¿Publicar rúbrica?',
      content: 'Al publicar la rúbrica estará disponible para usar en evaluaciones.',
      okText: 'Publicar',
      cancelText: 'Cancelar',
      onOk: async () => {
        await publishRubric(rubric.id);
      }
    });
  };

  // Eliminar rúbrica
  const handleDeleteRubric = async (rubric: Rubric) => {
    Modal.confirm({
      title: '¿Eliminar rúbrica?',
      content: `Esta acción eliminará permanentemente la rúbrica "${rubric.name}".`,
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      okType: 'danger',
      onOk: async () => {
        await deleteRubric(rubric.id);
      }
    });
  };

  // Cambiar visibilidad para familias
  const handleToggleFamilyVisibility = async (rubric: Rubric) => {
    await updateRubric(rubric.id, {
      isVisibleToFamilies: !rubric.isVisibleToFamilies
    });
  };

  // Éxito en operaciones
  const handleOperationSuccess = (rubric: Rubric) => {
    fetchRubrics(true);
    setEditorVisible(false);
    setImporterVisible(false);
  };

  // Menú de acciones para cada rúbrica
  const getActionMenu = (rubric: Rubric) => ({
    items: [
      {
        key: 'view',
        label: 'Ver Rúbrica',
        icon: <EyeOutlined />,
        onClick: () => handleViewRubric(rubric)
      },
      {
        key: 'edit',
        label: 'Editar',
        icon: <EditOutlined />,
        onClick: () => handleEditRubric(rubric)
      },
      {
        key: 'duplicate',
        label: 'Duplicar',
        icon: <CopyOutlined />,
        onClick: () => handleDuplicateRubric(rubric)
      },
      {
        type: 'divider' as const
      },
      ...(rubric.status === 'draft' ? [{
        key: 'publish',
        label: 'Publicar',
        icon: <ShareAltOutlined />,
        onClick: () => handlePublishRubric(rubric)
      }] : []),
      {
        key: 'toggle-family',
        label: rubric.isVisibleToFamilies ? 'Ocultar de familias' : 'Mostrar a familias',
        onClick: () => handleToggleFamilyVisibility(rubric)
      },
      {
        type: 'divider' as const
      },
      {
        key: 'delete',
        label: 'Eliminar',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteRubric(rubric)
      }
    ]
  });

  // Columnas de la tabla
  const columns: ColumnsType<Rubric> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, rubric: Rubric) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ cursor: 'pointer' }} onClick={() => handleViewRubric(rubric)}>
            {name}
          </Text>
          {rubric.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {rubric.description}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Borrador', value: 'draft' },
        { text: 'Activo', value: 'active' },
        { text: 'Archivado', value: 'archived' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const statusConfig = {
          draft: { color: 'orange', text: 'Borrador' },
          active: { color: 'green', text: 'Activo' },
          archived: { color: 'gray', text: 'Archivado' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Estructura',
      key: 'structure',
      width: 150,
      render: (_, rubric: Rubric) => (
        <Space>
          <Tag color="blue">{rubric.criteriaCount}C</Tag>
          <Tag color="purple">{rubric.levelsCount}N</Tag>
          <Tag color="orange">{rubric.maxScore}pts</Tag>
        </Space>
      )
    },
    {
      title: 'Tipo',
      key: 'type',
      width: 120,
      filters: [
        { text: 'Plantilla', value: true },
        { text: 'Rúbrica', value: false }
      ],
      onFilter: (value, record) => record.isTemplate === value,
      render: (_, rubric: Rubric) => (
        <Space direction="vertical" size="small">
          {rubric.isTemplate && <Tag color="cyan">Plantilla</Tag>}
          {rubric.isVisibleToFamilies && (
            <Tag color="green" style={{ fontSize: '10px' }}>
              Familias
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Modificado',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {new Date(date).toLocaleDateString()}
        </Text>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, rubric: Rubric) => (
        <Space>
          <Tooltip title="Ver rúbrica">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewRubric(rubric)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditRubric(rubric)}
            />
          </Tooltip>
          <Dropdown menu={getActionMenu(rubric)} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Gestión de Rúbricas
          </Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewRubric}
            >
              Nueva Rúbrica
            </Button>
            <Button
              icon={<ImportOutlined />}
              onClick={handleImportRubric}
            >
              Importar desde ChatGPT
            </Button>
          </Space>
        </div>

        {/* Estadísticas */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Total" value={stats.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Activas" value={stats.active} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Borradores" value={stats.drafts} valueStyle={{ color: '#fa8c16' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Plantillas" value={stats.templates} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
        </Row>

        {/* Filtros */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Search
                placeholder="Buscar rúbricas..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Estado"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">Todos los estados</Option>
                <Option value="draft">Borrador</Option>
                <Option value="active">Activo</Option>
                <Option value="archived">Archivado</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Tipo"
                value={templateFilter}
                onChange={setTemplateFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">Todos los tipos</Option>
                <Option value="template">Solo plantillas</Option>
                <Option value="rubric">Solo rúbricas</Option>
              </Select>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Tabla de rúbricas */}
      <Card>
        {error ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="danger">Error al cargar las rúbricas: {error}</Text>
            <br />
            <Button onClick={() => fetchRubrics(true)} style={{ marginTop: '16px' }}>
              Reintentar
            </Button>
          </div>
        ) : filteredRubrics.length === 0 && !loading ? (
          <Empty
            description="No se encontraron rúbricas"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleNewRubric}>
              Crear Primera Rúbrica
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRubrics}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} rúbricas`
            }}
          />
        )}
      </Card>

      {/* Modals */}
      <RubricEditor
        visible={editorVisible}
        onCancel={() => setEditorVisible(false)}
        onSuccess={handleOperationSuccess}
        editingRubric={editingRubric}
      />

      <RubricImporter
        visible={importerVisible}
        onCancel={() => setImporterVisible(false)}
        onSuccess={handleOperationSuccess}
      />

      <Modal
        title={viewingRubric?.name}
        open={viewerVisible}
        onCancel={() => setViewerVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setViewerVisible(false)}>
            Cerrar
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              if (viewingRubric) {
                setViewerVisible(false);
                handleEditRubric(viewingRubric);
              }
            }}
          >
            Editar
          </Button>
        ]}
      >
        {viewingRubric && (
          <RubricGrid
            rubric={viewingRubric}
            editable={false}
            viewMode="view"
          />
        )}
      </Modal>
    </div>
  );
};

export default RubricsPage;