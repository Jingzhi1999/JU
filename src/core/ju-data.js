/* STUB — replaced once spec/state-inventory.md lands */
(function (global) {
  var JU = global.JU = global.JU || {};
  JU.INDEX = [
    { key: 'j-list', group: '参加者', label: '当前（默认）', role: 'joined', section: 'current' },
    { key: 'j-history', group: '参加者', label: '历史', role: 'joined', section: 'history' },
    { key: 'h-list', group: '局主', label: '当前（默认）', role: 'hosted', section: 'current' },
    { key: 'b-empty', group: '边界', label: '完全空', role: 'joined', section: 'current', variant: 'empty' }
  ];
  JU.data = function (variant) { return { variant: variant, events: variant === 'empty' ? [] : [{ id: 'e1', title: '法拉盛饺子局', when: '周六 12.19 · 20:30', place: '法拉盛' }, { id: 'e2', title: '周末爬山', when: '周日 12.20 · 08:00', place: '熊山' }] }; };
})(typeof window !== 'undefined' ? window : this);
