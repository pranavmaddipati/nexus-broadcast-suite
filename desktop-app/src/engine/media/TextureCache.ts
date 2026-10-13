export class TextureCache {
  private static textures = new Map<string, any>();

  static getTexture(id: string) {
    return this.textures.get(id);
  }

  static setTexture(id: string, texture: any) {
    this.textures.set(id, texture);
  }

  static clear(id: string) {
    this.textures.delete(id);
  }

  static clearAll() {
    this.textures.clear();
  }
}
