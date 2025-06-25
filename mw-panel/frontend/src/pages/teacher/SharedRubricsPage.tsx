import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Tag,
  Modal,
  message,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Empty,
  Tooltip,
  Alert
} from 'antd';
import {
  EyeOutlined,
  CopyOutlined,
  ImportOutlined,
  SearchOutlined,
  FilterOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Rubric, useRubrics } from '../../hooks/useRubrics';
import RubricGrid from '../../components/rubrics/RubricGrid';
import RubricEditor from '../../components/rubrics/RubricEditor';
import apiClient from '@services/apiClient';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface SharedRubricsPageProps {}

interface SharedRubric extends Rubric {
  sharedByTeacher?: {
    id: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
  sharedAt?: string;
}

const SharedRubricsPage: React.FC<SharedRubricsPageProps> = () => {
  const {
    loading,
    error,
    createRubric,
    fetchRubrics,
    fetchSharedWithMe
  } = useRubrics();

  const [sharedRubrics, setSharedRubrics] = useState<SharedRubric[]>([]);
  const [filteredRubrics, setFilteredRubrics] = useState<SharedRubric[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [subjectAssignments, setSubjectAssignments] = useState<Array<{ id: string; subject: { name: string; code: string } }>>([]);
  
  // Modals
  const [viewerVisible, setViewerVisible] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [confirmCopyVisible, setConfirmCopyVisible] = useState(false);
  
  // Estados de edición
  const [viewingRubric, setViewingRubric] = useState<SharedRubric | null>(null);
  const [copyingRubric, setCopyingRubric] = useState<SharedRubric | null>(null);
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);

  // Cargar rúbricas compartidas al montar el componente
  useEffect(() => {
    loadSharedRubrics();
    fetchCurrentTeacherId();
    fetchSubjectAssignments();
  }, []);

  // Obtener ID del profesor actual
  const fetchCurrentTeacherId = async () => {
    try {
      // Get current user info first to find teacher ID
      const userResponse = await apiClient.get('/auth/me');
      const currentUser = userResponse.data;
      
      // If not a teacher, show error
      if (currentUser.role !== 'teacher') {
        console.error('Acceso denegado: Solo profesores pueden acceder a este panel');
        return;
      }
      
      // Find teacher by user ID (same approach as TeacherDashboard)
      const teachersResponse = await apiClient.get('/teachers');
      const teachers = teachersResponse.data;
      
      const currentTeacher = teachers.find((teacher: any) => teacher.user.id === currentUser.id);
      
      if (currentTeacher) {
        setCurrentTeacherId(currentTeacher.id);
      } else {
        console.error('No se encontró el perfil de profesor para este usuario');
      }
    } catch (error) {
      console.error('Error al obtener ID del profesor:', error);
    }
  };

  // Obtener asignaturas del profesor
  const fetchSubjectAssignments = async () => {
    try {
      const response = await apiClient.get('/activities/teacher/subject-assignments');
      setSubjectAssignments(response.data);
    } catch (error: any) {
      console.error('Error fetching subject assignments:', error);
    }
  };

  // Obtener rúbricas compartidas conmigo usando el hook
  const loadSharedRubrics = async () => {
    try {
      const rubrics = await fetchSharedWithMe();
      console.log('SharedRubricsPage - Received rubrics:', rubrics);
      setSharedRubrics(rubrics);
    } catch (err: any) {
      console.error('Error loading shared rubrics:', err);
      // El hook ya maneja el mensaje de error
    }
  };

  // Filtrar rúbricas
  useEffect(() => {
    let filtered = [...sharedRubrics];

    // Filtro por texto
    if (searchText) {
      filtered = filtered.filter(rubric =>
        rubric.name.toLowerCase().includes(searchText.toLowerCase()) ||
        rubric.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        rubric.sharedByTeacher?.user.profile.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        rubric.sharedByTeacher?.user.profile.lastName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rubric => rubric.status === statusFilter);
    }

    // Filtro por asignatura (buscar en subjectAssignmentId)
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(rubric => rubric.subjectAssignmentId === subjectFilter);
    }

    setFilteredRubrics(filtered);
  }, [sharedRubrics, searchText, statusFilter, subjectFilter]);

  // Estadísticas
  const stats = {
    total: sharedRubrics.length,
    active: sharedRubrics.filter(r => r.status === 'active').length,
    bySubjects: sharedRubrics.reduce((acc, rubric) => {
      const subjectId = rubric.subjectAssignmentId;
      if (subjectId) {
        acc[subjectId] = (acc[subjectId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    uniqueTeachers: new Set(sharedRubrics.map(r => r.sharedByTeacher?.id)).size,
  };

  // Ver rúbrica
  const handleViewRubric = (rubric: SharedRubric) => {
    setViewingRubric(rubric);
    setViewerVisible(true);
  };

  // Preparar para copiar rúbrica
  const handleCopyRubric = (rubric: SharedRubric) => {
    setCopyingRubric(rubric);
    setConfirmCopyVisible(true);
  };

  // Confirmar y crear copia de la rúbrica
  const handleConfirmCopy = async () => {
    if (!copyingRubric) return;

    try {
      const copyData = {
        name: `${copyingRubric.name} (Mi Copia)`,
        description: copyingRubric.description ? `${copyingRubric.description}\n\n[Copiado de: ${copyingRubric.sharedByTeacher?.user.profile.firstName} ${copyingRubric.sharedByTeacher?.user.profile.lastName}]` : `Copiado de: ${copyingRubric.sharedByTeacher?.user.profile.firstName} ${copyingRubric.sharedByTeacher?.user.profile.lastName}`,
        isTemplate: false,
        isVisibleToFamilies: copyingRubric.isVisibleToFamilies,
        maxScore: copyingRubric.maxScore,
        criteria: copyingRubric.criteria.map(criterion => ({
          name: criterion.name,
          description: criterion.description,
          order: criterion.order,
          weight: criterion.weight
        })),
        levels: copyingRubric.levels.map(level => ({
          name: level.name,
          description: level.description,
          order: level.order,
          scoreValue: level.scoreValue,
          color: level.color
        })),
        cells: copyingRubric.cells.map(cell => ({
          content: cell.content,
          criterionId: cell.criterionId,
          levelId: cell.levelId
        }))
      };

      const newRubric = await createRubric(copyData);
      if (newRubric) {
        message.success('Rúbrica copiada exitosamente a tu cuaderno');
        setConfirmCopyVisible(false);
        setCopyingRubric(null);
        
        // Refrescar las rúbricas propias
        fetchRubrics(true);
      }
    } catch (error) {
      console.error('Error copying rubric:', error);
      message.error('Error al copiar la rúbrica');
    }
  };

  // Abrir editor para personalizar copia
  const handleCustomizeCopy = () => {
    if (!copyingRubric) return;

    const customizedRubric = {
      ...copyingRubric,
      name: `${copyingRubric.name} (Mi Versión)`,
      description: copyingRubric.description ? `${copyingRubric.description}\n\n[Basado en rúbrica de: ${copyingRubric.sharedByTeacher?.user.profile.firstName} ${copyingRubric.sharedByTeacher?.user.profile.lastName}]` : `Basado en rúbrica de: ${copyingRubric.sharedByTeacher?.user.profile.firstName} ${copyingRubric.sharedByTeacher?.user.profile.lastName}`,
      status: 'draft' as const,
      isTemplate: false
    };

    setConfirmCopyVisible(false);
    setCopyingRubric(customizedRubric);
    setEditorVisible(true);
  };

  // Éxito en operaciones
  const handleOperationSuccess = (rubric: Rubric) => {
    fetchRubrics(true);
    setEditorVisible(false);
    setCopyingRubric(null);
  };

  // Obtener nombre de asignatura por ID
  const getSubjectName = (subjectAssignmentId?: string) => {
    if (!subjectAssignmentId) return 'Sin asignatura';
    const assignment = subjectAssignments.find(a => a.id === subjectAssignmentId);
    return assignment ? `${assignment.subject.code} - ${assignment.subject.name}` : 'Asignatura desconocida';
  };

  // Columnas de la tabla
  const columns: ColumnsType<SharedRubric> = [
    {
      title: 'Rúbrica',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, rubric: SharedRubric) => (
        <Space direction="vertical" size="small">
          <Space>
            <Text strong style={{ cursor: 'pointer' }} onClick={() => handleViewRubric(rubric)}>
              {name}
            </Text>
            <Tag color="cyan" icon={<ShareAltOutlined />}>
              Compartida
            </Tag>
          </Space>
          {rubric.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {rubric.description.length > 100 
                ? `${rubric.description.substring(0, 100)}...` 
                : rubric.description
              }
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Compartida por',
      key: 'sharedBy',
      width: 150,
      render: (_, rubric: SharedRubric) => (
        <Space direction="vertical" size="small">
          <Space>
            <UserOutlined />
            <Text>
              {rubric.sharedByTeacher?.user.profile.firstName} {rubric.sharedByTeacher?.user.profile.lastName}
            </Text>
          </Space>
          {rubric.sharedAt && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {new Date(rubric.sharedAt).toLocaleDateString()}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Activo', value: 'active' },
        { text: 'Borrador', value: 'draft' },
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
      width: 120,
      render: (_, rubric: SharedRubric) => (
        <Space>
          <Tag color="blue">{rubric.criteriaCount}C</Tag>
          <Tag color="purple">{rubric.levelsCount}N</Tag>
          <Tag color="orange">{rubric.maxScore}pts</Tag>
        </Space>
      )
    },
    {
      title: 'Asignatura',
      key: 'subject',
      width: 120,
      render: (_, rubric: SharedRubric) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {getSubjectName(rubric.subjectAssignmentId)}
        </Text>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, rubric: SharedRubric) => (
        <Space>
          <Tooltip title="Ver rúbrica">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewRubric(rubric)}
            />
          </Tooltip>
          <Tooltip title="Copiar a mi cuaderno">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyRubric(rubric)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Rúbricas Compartidas
          </Title>
          <Space>
            <Button
              icon={<ImportOutlined />}
              onClick={() => window.location.href = '/teacher/rubrics'}
            >
              Ir a Mis Rúbricas
            </Button>
          </Space>
        </div>

        <Alert
          message="Rúbricas compartidas por colegas"
          description="Aquí puedes ver las rúbricas que otros profesores han compartido contigo. Puedes copiarlas a tu cuaderno de rúbricas y personalizarlas según tus necesidades."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        {/* Estadísticas */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Total Compartidas" value={stats.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Activas" value={stats.active} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Profesores" value={stats.uniqueTeachers} prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Asignaturas" value={Object.keys(stats.bySubjects).length} prefix={<BookOutlined />} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>

        {/* Filtros */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Search
                placeholder="Buscar rúbricas o profesores..."
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
            <Col span={6}>
              <Select
                placeholder="Asignatura"
                value={subjectFilter}
                onChange={setSubjectFilter}
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">Todas las asignaturas</Option>
                {subjectAssignments.map(assignment => (
                  <Option key={assignment.id} value={assignment.id}>
                    {assignment.subject.code} - {assignment.subject.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Tabla de rúbricas compartidas */}
      <Card>
        {error ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="danger">Error al cargar las rúbricas compartidas: {error}</Text>
            <br />
            <Button onClick={loadSharedRubrics} style={{ marginTop: '16px' }}>
              Reintentar
            </Button>
          </div>
        ) : filteredRubrics.length === 0 && !loading ? (
          <Empty
            description="No hay rúbricas compartidas contigo"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text type="secondary">
              Cuando otros profesores compartan rúbricas contigo, aparecerán aquí.
            </Text>
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
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} rúbricas compartidas`
            }}
          />
        )}
      </Card>

      {/* Modal para ver rúbrica */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>{viewingRubric?.name}</span>
            <Tag color="cyan">Compartida por {viewingRubric?.sharedByTeacher?.user.profile.firstName} {viewingRubric?.sharedByTeacher?.user.profile.lastName}</Tag>
          </Space>
        }
        open={viewerVisible}
        onCancel={() => setViewerVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setViewerVisible(false)}>
            Cerrar
          </Button>,
          <Button
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => {
              if (viewingRubric) {
                setViewerVisible(false);
                handleCopyRubric(viewingRubric);
              }
            }}
          >
            Copiar a Mi Cuaderno
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

      {/* Modal de confirmación para copiar */}
      <Modal
        title="Copiar Rúbrica"
        open={confirmCopyVisible}
        onCancel={() => setConfirmCopyVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmCopyVisible(false)}>
            Cancelar
          </Button>,
          <Button key="copy" type="primary" onClick={handleConfirmCopy}>
            Copiar Tal Como Está
          </Button>,
          <Button key="customize" type="primary" onClick={handleCustomizeCopy}>
            Copiar y Personalizar
          </Button>
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>¿Cómo quieres copiar esta rúbrica?</Title>
            <Text type="secondary">
              Puedes copiar la rúbrica tal como está o personalizarla antes de añadirla a tu cuaderno.
            </Text>
          </div>
          
          {copyingRubric && (
            <Card size="small" style={{ backgroundColor: '#f9f9f9' }}>
              <Space direction="vertical" size="small">
                <Text strong>{copyingRubric.name}</Text>
                <Text type="secondary">
                  Compartida por: {copyingRubric.sharedByTeacher?.user.profile.firstName} {copyingRubric.sharedByTeacher?.user.profile.lastName}
                </Text>
                <Space>
                  <Tag color="blue">{copyingRubric.criteriaCount} criterios</Tag>
                  <Tag color="purple">{copyingRubric.levelsCount} niveles</Tag>
                  <Tag color="orange">Máx: {copyingRubric.maxScore} pts</Tag>
                </Space>
              </Space>
            </Card>
          )}

          <div>
            <Title level={5}>Opciones:</Title>
            <ul style={{ paddingLeft: '20px' }}>
              <li><Text strong>Copiar tal como está:</Text> Se añadirá la rúbrica exacta a tu cuaderno con el nombre "(Mi Copia)"</li>
              <li><Text strong>Copiar y personalizar:</Text> Podrás modificar criterios, niveles y descripción antes de guardar</li>
            </ul>
          </div>
        </Space>
      </Modal>

      {/* Editor para personalizar copia */}
      <RubricEditor
        visible={editorVisible}
        onCancel={() => {
          setEditorVisible(false);
          setCopyingRubric(null);
        }}
        onSuccess={handleOperationSuccess}
        editingRubric={copyingRubric}
        subjectAssignments={subjectAssignments}
      />
    </div>
  );
};

export default SharedRubricsPage;