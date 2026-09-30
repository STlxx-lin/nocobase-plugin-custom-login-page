/**
 * 动态按需加载区块内容编辑抽屉 (Dynamic Code-Splitting)
 * 仅在设计模式下用户点击配置时才异步拉取编辑抽屉代码分包，
 * 避免在前台登录路由静态引入 4300+ 行庞大表单组件，大幅缩减主包体积与首屏加载时间
 */
export const openBlockContentEditor = async (model: any, onSave?: () => void): Promise<void> => {
  const { openBlockContentEditor: openDrawer } = await import('./BlockContentEditorDrawer');
  openDrawer(model, onSave);
};

export default openBlockContentEditor;
