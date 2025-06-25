import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  List, 
  Avatar,
  Divider,
  message
} from 'antd';
import { 
  ShareAltOutlined, 
  UserOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { Rubric, useRubrics } from '../../hooks/useRubrics';

const { Title, Text } = Typography;
const { Option } = Select;

interface RubricSharingModalProps {
  visible: boolean;
  onCancel: () => void;
  rubric: Rubric | null;
  currentTeacherId: string;
}

interface Colleague {
  id: string;
  name: string;
  email: string;
}

const RubricSharingModal: React.FC<RubricSharingModalProps> = ({
  visible,
  onCancel,
  rubric,
  currentTeacherId
}) => {
  const [form] = Form.useForm();
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharedColleagues, setSharedColleagues] = useState<Colleague[]>([]);
  const { shareRubric, unshareRubric, fetchColleagues } = useRubrics();

  useEffect(() => {
    if (visible) {
      loadColleagues();
      loadSharedColleagues();
    }
  }, [visible, rubric]);

  const loadColleagues = async () => {
    try {
      const data = await fetchColleagues();
      setColleagues(data);
    } catch (error) {
      message.error('Error al cargar la lista de profesores');
    }
  };

  const loadSharedColleagues = () => {
    if (rubric?.sharedWith) {
      const shared = colleagues.filter(colleague => 
        rubric.sharedWith?.includes(colleague.id)
      );
      setSharedColleagues(shared);
    } else {
      setSharedColleagues([]);
    }
  };

  useEffect(() => {
    loadSharedColleagues();
  }, [colleagues, rubric]);

  const handleShare = async (values: { teacherIds: string[] }) => {
    if (!rubric || !values.teacherIds.length) return;

    setLoading(true);
    try {
      const success = await shareRubric(rubric.id, values.teacherIds);
      if (success) {
        form.resetFields();
        loadSharedColleagues();
        message.success('Rúbrica compartida exitosamente');
      }
    } catch (error) {
      message.error('Error al compartir la rúbrica');
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async (teacherId: string) => {
    if (!rubric) return;

    setLoading(true);
    try {
      const success = await unshareRubric(rubric.id, [teacherId]);
      if (success) {
        loadSharedColleagues();
        message.success('Acceso retirado exitosamente');
      }
    } catch (error) {
      message.error('Error al retirar el acceso');
    } finally {
      setLoading(false);
    }
  };

  const availableColleagues = colleagues.filter(colleague => 
    !rubric?.sharedWith?.includes(colleague.id)
  );

  return (
    <Modal
      title={
        <Space>
          <ShareAltOutlined />
          <span>Compartir Rúbrica: {rubric?.name}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Cerrar
        </Button>
      ]}
      width={600}
    >
      {rubric && (
        <div>
          {/* Información de la rúbrica */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <Title level={5} className="mb-2">{rubric.name}</Title>
            {rubric.description && (
              <Text type="secondary" className="block mb-2">{rubric.description}</Text>
            )}
            <Space>
              <Tag color="blue">{rubric.criteriaCount} criterios</Tag>
              <Tag color="purple">{rubric.levelsCount} niveles</Tag>
              <Tag color="orange">Máx: {rubric.maxScore} pts</Tag>
            </Space>
          </div>

          {/* Compartir con nuevos profesores */}
          <div className="mb-6">
            <Title level={5}>Compartir con profesores</Title>
            <Form
              form={form}
              onFinish={handleShare}
              layout="vertical"
            >
              <Form.Item
                name="teacherIds"
                label="Seleccionar profesores"
                rules={[{ required: true, message: 'Selecciona al menos un profesor' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Buscar y seleccionar profesores..."
                  showSearch
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  disabled={availableColleagues.length === 0}
                >
                  {availableColleagues.map(colleague => (
                    <Option key={colleague.id} value={colleague.id}>
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <span>{colleague.name}</span>
                        <Text type="secondary">({colleague.email})</Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  disabled={availableColleagues.length === 0}
                  icon={<ShareAltOutlined />}
                >
                  Compartir
                </Button>
              </Form.Item>
            </Form>

            {availableColleagues.length === 0 && (
              <Text type="secondary">
                No hay más profesores disponibles para compartir.
              </Text>
            )}
          </div>

          <Divider />

          {/* Lista de profesores con acceso */}
          <div>
            <Title level={5}>
              Profesores con acceso ({sharedColleagues.length})
            </Title>
            
            {sharedColleagues.length > 0 ? (
              <List
                dataSource={sharedColleagues}
                renderItem={colleague => (
                  <List.Item
                    actions={[
                      <Button
                        key="remove"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleUnshare(colleague.id)}
                        loading={loading}
                        size="small"
                      >
                        Retirar acceso
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={colleague.name}
                      description={colleague.email}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">
                Esta rúbrica no ha sido compartida con ningún profesor.
              </Text>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RubricSharingModal;