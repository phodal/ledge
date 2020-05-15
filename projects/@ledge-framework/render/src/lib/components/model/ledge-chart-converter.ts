const LedgeChartConverter = {
  toTreeData(data: any) {
    if (!data) {
      return {};
    }

    if (data && data.length === 1) {
      const anies = this.transformTreeData(data);
      return anies[0];
    }

    const treeInfo = this.transformTreeData(data);
    return {
      name: '',
      children: treeInfo,
      config: data.config,
    };
  },

  transformTreeData(data: any) {
    const nodes = [];
    for (const item of data) {
      const node: any = {};
      node.name = item.name;
      if (item.children && item.children.length > 0) {
        node.children = this.transformTreeData(item.children);
      }
      nodes.push(node);
    }
    return nodes;
  },
};

export default LedgeChartConverter;
