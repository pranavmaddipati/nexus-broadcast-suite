using System;
using System.IO;
using System.IO.MemoryMappedFiles;
using System.Runtime.InteropServices;

public class VirtualCamBridge {
    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct QueueHeader {
        public uint WriteIdx;
        public uint ReadIdx;
        public uint State;
        public uint Offset0;
        public uint Offset1;
        public uint Offset2;
        public uint Type;
        public uint Cx;
        public uint Cy;
        public ulong Interval;
        public uint Reserved0;
        public uint Reserved1;
        public uint Reserved2;
        public uint Reserved3;
        public uint Reserved4;
        public uint Reserved5;
        public uint Reserved6;
        public uint Reserved7;
    }

    public static void Main(string[] args) {
        if (args.Length < 2) {
            Console.Error.WriteLine("Usage: VirtualCamBridge <width> <height> [device_index]");
            return;
        }

        int cx = int.Parse(args[0]);
        int cy = int.Parse(args[1]);
        int deviceIndex = args.Length > 2 ? int.Parse(args[2]) : 0;

        string mapName = "OBSVirtualCamVideo";
        if (deviceIndex > 0) {
            mapName = "OBSVirtualCamVideo" + deviceIndex;
        }

        int frameSize = cx * cy * 3 / 2; // NV12: Y + U + V (Y size + Y/2)
        int headerSize = Marshal.SizeOf(typeof(QueueHeader)); // 76 bytes
        int alignedHeaderSize = (headerSize + 31) & ~31;      // Aligned to 32 bytes (96 bytes)

        int[] offsets = new int[3];
        int size = alignedHeaderSize;

        // Triple buffering offsets
        offsets[0] = size;
        size += frameSize + 32; // Frame data + 32 byte timestamp header
        size = (size + 31) & ~31;

        offsets[1] = size;
        size += frameSize + 32;
        size = (size + 31) & ~31;

        offsets[2] = size;
        size += frameSize + 32;
        size = (size + 31) & ~31;

        Console.Error.WriteLine("VirtualCamBridge: Mapped name = " + mapName + ", size = " + size);

        MemoryMappedFile mmf = null;
        MemoryMappedViewAccessor accessor = null;

        try {
            mmf = MemoryMappedFile.CreateOrOpen(mapName, size, MemoryMappedFileAccess.ReadWrite);
            accessor = mmf.CreateViewAccessor(0, size, MemoryMappedFileAccess.ReadWrite);

            // Initialize queue header
            QueueHeader header = new QueueHeader();
            header.WriteIdx = 0;
            header.ReadIdx = 0;
            header.State = 2; // SHARED_QUEUE_STATE_READY
            header.Offset0 = (uint)offsets[0];
            header.Offset1 = (uint)offsets[1];
            header.Offset2 = (uint)offsets[2];
            header.Type = 0; // SHARED_QUEUE_TYPE_VIDEO
            header.Cx = (uint)cx;
            header.Cy = (uint)cy;
            header.Interval = 166666; // 60 FPS (10,000,000 / 60)

            accessor.Write(0, ref header);

            byte[] buffer = new byte[frameSize];
            Stream stdin = Console.OpenStandardInput();
            long startTimeTicks = DateTime.UtcNow.Ticks;

            while (true) {
                int bytesRead = 0;
                while (bytesRead < frameSize) {
                    int read = stdin.Read(buffer, bytesRead, frameSize - bytesRead);
                    if (read <= 0) break; // EOF
                    bytesRead += read;
                }

                if (bytesRead < frameSize) break;

                // Read current write and read indices
                uint currentWriteIdx = accessor.ReadUInt32(0);
                uint readIdx = accessor.ReadUInt32(4);
                uint nextWriteIdx = (currentWriteIdx + 1) % 3;

                // Write timestamp (in 100ns units)
                ulong timestamp = (ulong)(DateTime.UtcNow.Ticks - startTimeTicks);
                accessor.Write(offsets[nextWriteIdx], timestamp);

                // Write frame raw data (NV12 format)
                accessor.WriteArray(offsets[nextWriteIdx] + 32, buffer, 0, frameSize);

                // Update write index (atomic-like write in header)
                accessor.Write(0, nextWriteIdx);
            }
        } catch (Exception ex) {
            Console.Error.WriteLine("VirtualCamBridge Error: " + ex.Message);
        } finally {
            if (accessor != null) accessor.Dispose();
            if (mmf != null) mmf.Dispose();
        }
    }
}
