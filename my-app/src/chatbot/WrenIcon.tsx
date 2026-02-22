import bearIcon from './bear-icon.png';

export default function WrenIcon({ size = 40 }: { size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#354a2f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      <img
        src={bearIcon}
        alt="Care Bear"
        style={{
          width: '88%',
          height: '88%',
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}
