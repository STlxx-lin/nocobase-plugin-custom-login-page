import React, { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Spin, Space, Button, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { BlockGridModel } from '@nocobase/client-v2';
import { useFlowEngine, FlowModelRenderer } from '@nocobase/flow-engine';
import { useT } from '../locale';
import { openBlockContentEditor } from './BlockContentEditorDrawer';
import {
  CustomLoginBlockModel,
  SignInFormBlockModel,
  CustomHeroBlockModel,
  CustomFeaturesBlockModel,
  CustomCarouselBlockModel,
  CustomStatsBlockModel,
  CustomHtmlBlockModel,
  CustomImageBlockModel,
  CustomNoticeBlockModel,
  CustomPartnersBlockModel,
  CustomContactBlockModel,
  CustomLanguageBlockModel,
  CustomCountdownBlockModel,
} from '../models';

export class LoginPageBlockGridModel extends BlockGridModel {
  get subModelBaseClasses() {
    return ['CustomLoginBlockModel', 'DataBlockModel', 'FilterBlockModel', 'BlockModel'];
  }
}

LoginPageBlockGridModel.define({
  createModelOptions: {
    use: 'LoginPageBlockGridModel',
  },
});

export interface LoginPageBlockGridCanvasProps {
  gridSchema?: any;
  designMode?: boolean;
  onModelReady?: (model: BlockGridModel) => void;
  originalSignInComponent?: React.ComponentType;
}

export interface LoginPageBlockGridCanvasRef {
  getModel: () => BlockGridModel | null;
  serialize: () => any;
  refresh: () => void;
}

export const DEFAULT_PRESET_GRID_SCHEMA = {
  use: 'LoginPageBlockGridModel',
  uid: 'custom_login_page_grid',
  props: {
    colGap: 24,
    rowGap: 24,
    layout: {
      version: 2,
      rows: [
        {
          id: 'row_login_main',
          cells: [
            {
              id: 'row_login_main:cell:0',
              items: ['hero_block_001', 'features_block_001'],
            },
            {
              id: 'row_login_main:cell:1',
              items: ['signin_form_block_001'],
            },
          ],
          sizes: [14, 10],
        },
      ],
    },
  },
  subModels: {
    items: [
      {
        uid: 'hero_block_001',
        use: 'CustomHeroBlockModel',
        parentId: 'custom_login_page_grid',
        subKey: 'items',
        subType: 'array',
        props: {
          title: '驱动企业数字化新未来',
          subtitle: '基于灵活可扩展的现代无代码与插件化体系，提供端到端企业级应用解决方案。',
          badge: '全新数字化协同架构',
          align: 'left',
          textColor: '#ffffff',
          titleSize: 42,
        },
      },
      {
        uid: 'features_block_001',
        use: 'CustomFeaturesBlockModel',
        parentId: 'custom_login_page_grid',
        subKey: 'items',
        subType: 'array',
        props: {
          columns: 3,
          cardBg: 'rgba(255, 255, 255, 0.12)',
          textColor: '#ffffff',
          items: [
            {
              icon: 'RocketOutlined',
              title: '极速敏捷构建',
              desc: '无需复杂全栈开发，分钟级搭建企业业务协同中枢与数据流转看板。',
              color: '#69b1ff',
            },
            {
              icon: 'SafetyCertificateOutlined',
              title: '金融级权限控制',
              desc: '支持原子级字段权限、行级过滤与多角色灵活权限策略隔离。',
              color: '#52c41a',
            },
            {
              icon: 'ThunderboltOutlined',
              title: '自动化流程引擎',
              desc: '全链路可视化任务编排与定时作业，大幅释放团队日常运转效能。',
              color: '#faad14',
            },
          ],
        },
      },
      {
        uid: 'signin_form_block_001',
        use: 'SignInFormBlockModel',
        parentId: 'custom_login_page_grid',
        subKey: 'items',
        subType: 'array',
        props: {
          title: '欢迎登录',
          subtitle: '请输入您的账号密码开启高效协同',
          cardBg: 'rgba(255, 255, 255, 0.96)',
          loginButtonText: '立即登录',
          buttonColor: '#1677ff',
        },
      },
    ],
  },
};

export const LoginPageBlockGridCanvas = forwardRef<LoginPageBlockGridCanvasRef, LoginPageBlockGridCanvasProps>(
  ({ gridSchema, designMode = true, onModelReady, originalSignInComponent }, ref) => {
    const t = useT();
    const flowEngine = useFlowEngine();
    const [gridModel, setGridModel] = useState<BlockGridModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [updateTick, setUpdateTick] = useState(0);

    // 同步设计模式全局标记与原生登录组件
    useEffect(() => {
      (window as any).__customLoginDesignMode = designMode;
      if (originalSignInComponent) {
        (window as any).__NocobaseOriginalSignInComponent = originalSignInComponent;
      }
      // 触发一次视图更新
      setUpdateTick((t) => t + 1);
    }, [designMode, originalSignInComponent]);

    if (originalSignInComponent) {
      (window as any).__NocobaseOriginalSignInComponent = originalSignInComponent;
    }

    useImperativeHandle(ref, () => ({
      getModel: () => gridModel,
      serialize: () => (gridModel?.serialize ? gridModel.serialize() : null),
      refresh: () => setUpdateTick((t) => t + 1),
    }));

    const schemaKey = React.useMemo(() => {
      if (!gridSchema) return 'empty';
      if (typeof gridSchema === 'string') return gridSchema;
      try {
        return JSON.stringify(gridSchema);
      } catch (e) {
        return String(Math.random());
      }
    }, [gridSchema]);

    useEffect(() => {
      let isMounted = true;
      const initModel = async () => {
        if (!flowEngine) return;
        setLoading(true);
        try {
          let resolvedSchema = gridSchema;
          if (typeof resolvedSchema === 'string') {
            try {
              resolvedSchema = JSON.parse(resolvedSchema);
            } catch (e) {
              resolvedSchema = null;
            }
          }
          const schema = resolvedSchema && resolvedSchema.use ? resolvedSchema : DEFAULT_PRESET_GRID_SCHEMA;
          try {
            const allModels: Record<string, any> = {
              CustomLoginBlockModel,
              LoginPageBlockGridModel,
              SignInFormBlockModel,
              CustomHeroBlockModel,
              CustomFeaturesBlockModel,
              CustomCarouselBlockModel,
              CustomStatsBlockModel,
              CustomHtmlBlockModel,
              CustomImageBlockModel,
              CustomNoticeBlockModel,
              CustomPartnersBlockModel,
              CustomContactBlockModel,
              CustomLanguageBlockModel,
              CustomCountdownBlockModel,
            };

            const modelsToRegister: Record<string, any> = {};
            const engineAny = flowEngine as any;
            Object.entries(allModels).forEach(([name, cls]) => {
              const has = typeof engineAny.hasModelClass === 'function'
                ? engineAny.hasModelClass(name)
                : Boolean(engineAny.getModelClass?.(name));
              if (!has) {
                modelsToRegister[name] = cls;
              }
            });

            if (Object.keys(modelsToRegister).length > 0) {
              flowEngine.registerModels?.(modelsToRegister);
            }
          } catch (regErr) {}
          const model = await flowEngine.createModelAsync(schema);
          if (isMounted && model) {
            // 确保创建区块菜单包含自定义登录页专属区块基类，从而将其全部分组在独立菜单中
            try {
              Object.defineProperty(model, 'subModelBaseClasses', {
                get() {
                  return ['CustomLoginBlockModel', 'DataBlockModel', 'FilterBlockModel', 'BlockModel'];
                },
                configurable: true,
              });
            } catch (e) {
              // 容错
            }
            setGridModel(model as BlockGridModel);
            onModelReady?.(model as BlockGridModel);
          }
        } catch (err) {
          console.error('初始化登录页原生区块网格失败:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      initModel();
      return () => {
        isMounted = false;
      };
    }, [flowEngine, schemaKey]);

    // 动态同步 flowSettings 状态
    useEffect(() => {
      if (!flowEngine?.flowSettings) return;
      try {
        if (designMode) {
          flowEngine.flowSettings.enable?.();
        } else {
          flowEngine.flowSettings.disable?.();
        }
      } catch (e) {
        // 容错
      }
    }, [designMode, flowEngine]);

    const getSubBlockList = useCallback(() => {
      if (!gridModel) return [];
      const list: any[] = [];
      const subModels = (gridModel as any).subModels?.items;
      if (Array.isArray(subModels)) {
        subModels.forEach((m: any) => list.push(m));
      } else if (subModels && typeof subModels === 'object') {
        Object.values(subModels).forEach((m: any) => list.push(m));
      }
      return list;
    }, [gridModel, updateTick]);

    if (loading || !gridModel) {
      return (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spin tip={t('Loading canvas...')} size="large" />
        </div>
      );
    }

    return (
      <div
        className={`login-page-block-grid-wrapper ${designMode ? 'is-design-mode' : 'is-preview-mode'}`}
        style={{
          width: '100%',
          minHeight: 400,
          position: 'relative',
        }}
      >
        {/* 官方原生网格渲染器 */}
        <FlowModelRenderer
          key={updateTick}
          model={gridModel as any}
          showFlowSettings={
            designMode
              ? {
                  showBackground: true,
                  showBorder: true,
                  showDragHandle: true,
                  toolbarPosition: 'inside',
                }
              : false
          }
        />
      </div>
    );
  }
);

LoginPageBlockGridCanvas.displayName = 'LoginPageBlockGridCanvas';
export default LoginPageBlockGridCanvas;
