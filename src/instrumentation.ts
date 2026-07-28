import sharp from "sharp";

export function register() {
  sharp.block({
    operation: ["VipsForeignLoadNsgif", "VipsForeignLoadTiff", "VipsForeignLoadVips"],
  });
}
